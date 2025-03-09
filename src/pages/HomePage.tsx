import { useState, useEffect } from 'react';
import { Clock, Crosshair } from 'lucide-react';
import { LocationInput } from '../components/LocationInput';
import { TripMap } from '../components/TripMap';
import { ELDLog } from '../components/ELDLog';
import { Location, TripDetails, DailyLog, TripPlan, LogEntry } from '../types';
import { calculateTripPlan, generateELDEntries } from '../utils/tripCalculator';

const defaultLocation: Location = {
  lat: 0,
  lng: 0,
  address: ''
};

export function HomePage() {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    currentLocation: defaultLocation,
    pickupLocation: defaultLocation,
    dropoffLocation: defaultLocation,
    currentCycleHours: 0
  });



  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date(),
    entries: [],
    totalHours: {
      driving: 0,
      onDuty: 0,
      offDuty: 0,
      sleeper: 0
    }
  });
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ELD-Trip-Planner/1.0',
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to get address');
      
      const data = await response.json();
      
      setTripDetails(prev => ({
        ...prev,
        currentLocation: {
          lat: latitude,
          lng: longitude,
          address: data.display_name
        }
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your current location. Please ensure location services are enabled.');
    } finally {
      setIsLocating(false);
    }
  };


  useEffect(() => {
    const { currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = tripDetails;
    
    if (currentLocation.lat && pickupLocation.lat && dropoffLocation.lat) {
      const plan = calculateTripPlan(
        currentLocation,
        pickupLocation,
        dropoffLocation,
        currentCycleHours
      );
      
      setTripPlan(plan);
      const entries = generateELDEntries(plan);
      
      const totalHours = entries.reduce((acc, entry) => {
        const duration = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
        const statusMapping: Record<LogEntry['status'], keyof typeof acc> = {
          'driving': 'driving',
          'on-duty': 'onDuty',
          'off-duty': 'offDuty',
          'sleeper': 'sleeper'
        };
        acc[statusMapping[entry.status]] += duration;
        return acc;
      }, {
        driving: 0,
        onDuty: 0,
        offDuty: 0,
        sleeper: 0
      });

      setDailyLog({
        date: new Date(),
        entries,
        totalHours
      });
    }
  }, [tripDetails]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Trip Details</h2>
            <div className="space-y-4">
              <div className="relative">
                <LocationInput
                  label="Current Location"
                  value={tripDetails.currentLocation}
                  onChange={(location) => setTripDetails(prev => ({ ...prev, currentLocation: location }))}
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className={`absolute right-2 top-8 p-1.5 rounded-md transition-colors ${
                    isLocating
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Use current location"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
              <LocationInput
                label="Pickup Location"
                value={tripDetails.pickupLocation}
                onChange={(location) => setTripDetails(prev => ({ ...prev, pickupLocation: location }))}
              />
              <LocationInput
                label="Dropoff Location"
                value={tripDetails.dropoffLocation}
                onChange={(location) => setTripDetails(prev => ({ ...prev, dropoffLocation: location }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Cycle Hours Used
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tripDetails.currentCycleHours}
                    onChange={(e) => setTripDetails(prev => ({
                      ...prev,
                      currentCycleHours: Math.min(70, Math.max(0, parseFloat(e.target.value) || 0))
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="70"
                    step="0.5"
                  />
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <TripMap
            currentLocation={tripDetails.currentLocation}
            pickupLocation={tripDetails.pickupLocation}
            dropoffLocation={tripDetails.dropoffLocation}
          />
        </div>
      </div>

      {tripPlan && (
        <div className="bg-white w-full mt-9 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              Total Distance: <span className="font-semibold">{Math.round(tripPlan.totalDistance)} miles</span>
            </p>
            <p className="text-gray-700">
              Total Duration: <span className="font-semibold">{Math.round(tripPlan.totalDuration * 10) / 10} hours</span>
            </p>
            <p className="text-gray-700">
              Required Breaks: <span className="font-semibold">{tripPlan.requiredBreaks}</span>
            </p>
            <p className="text-gray-700">
              Required Rest Periods: <span className="font-semibold">{tripPlan.requiredRests}</span>
            </p>
          </div>
        </div>
      )}
      
      <div className='mt-5'>
        <ELDLog 
          log={dailyLog}
          onLogUpdate={setDailyLog}
        />
      </div>
    </div>
  );
}