import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types';

interface TripMapProps {
  currentLocation: Location;
  pickupLocation: Location;
  dropoffLocation: Location;
}

export const TripMap: React.FC<TripMapProps> = ({
  currentLocation,
  pickupLocation,
  dropoffLocation,
}) => {
  const center = {
    lat: (currentLocation.lat + pickupLocation.lat + dropoffLocation.lat) / 3,
    lng: (currentLocation.lng + pickupLocation.lng + dropoffLocation.lng) / 3,
  };

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[currentLocation.lat, currentLocation.lng]}>
          <Popup>Current Location</Popup>
        </Marker>
        <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>
        <Marker position={[dropoffLocation.lat, dropoffLocation.lng]}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}