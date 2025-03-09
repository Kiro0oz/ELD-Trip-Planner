import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location, RouteSegment } from '../types';


interface TripMapProps {
  currentLocation: Location;
  pickupLocation: Location;
  dropoffLocation: Location;
  segments?: RouteSegment[];
}

// Custom hook to update map bounds
function MapBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new L.LatLngBounds(
        locations.map(loc => [loc.lat, loc.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

export const TripMap: React.FC<TripMapProps> = ({
  currentLocation,
  pickupLocation,
  dropoffLocation,
}) => {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [gasStations, setGasStations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        // Fetch route from OSRM
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes?.[0]?.geometry?.coordinates) {
          // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
          setRoutePoints(data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]));
          
          // Calculate gas stations every 500 miles
          const totalDistance = data.routes[0].distance * 0.000621371; // Convert meters to miles
          const numStops = Math.floor(totalDistance / 500);
          
          if (numStops > 0) {
            const stations = Array.from({ length: numStops }, (_, i) => {
              const progress = (i + 1) / (numStops + 1);
              const idx = Math.floor(data.routes[0].geometry.coordinates.length * progress);
              const coord = data.routes[0].geometry.coordinates[idx];
              return {
                lat: coord[1],
                lng: coord[0],
                address: `Gas Station ${i + 1}`
              };
            });
            setGasStations(stations);
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    if (currentLocation.lat && pickupLocation.lat && dropoffLocation.lat) {
      fetchRoute();
    }
  }, [currentLocation, pickupLocation, dropoffLocation]);

  const locations = [currentLocation, pickupLocation, dropoffLocation, ...gasStations];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[currentLocation.lat || 0, currentLocation.lng || 0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Current Location */}
        <Marker position={[currentLocation.lat, currentLocation.lng]}>
          <Popup>
            <div className="font-semibold">Current Location</div>
            <div className="text-sm">{currentLocation.address}</div>
          </Popup>
        </Marker>

        {/* Pickup Location */}
        <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
          <Popup>
            <div className="font-semibold">Pickup Location</div>
            <div className="text-sm">{pickupLocation.address}</div>
          </Popup>
        </Marker>

        {/* Dropoff Location */}
        <Marker position={[dropoffLocation.lat, dropoffLocation.lng]}>
          <Popup>
            <div className="font-semibold">Dropoff Location</div>
            <div className="text-sm">{dropoffLocation.address}</div>
          </Popup>
        </Marker>

        {/* Gas Stations */}
        {gasStations.map((station, index) => (
          <Marker
            key={`gas-${index}`}
            position={[station.lat, station.lng]}
            icon={L.divIcon({
              className: 'bg-yellow-500 rounded-full p-2',
              html: `<div class="bg-yellow-500 p-2 rounded-full"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"></path><path d="M12 12v6"></path><path d="M8 12v6"></path><path d="M16 12v6"></path></svg></div>`,
              iconSize: [30, 30]
            })}
          >
            <Popup>
              <div className="font-semibold">Gas Station</div>
              <div className="text-sm">Recommended refueling stop</div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />
        )}

        <MapBounds locations={locations} />
      </MapContainer>
    </div>
  );
};