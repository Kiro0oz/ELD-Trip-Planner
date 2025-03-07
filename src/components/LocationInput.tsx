import React, { useState, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Location } from '../types';

interface LocationInputProps {
  label: string;
  value: Location;
  onChange: (location: Location) => void;
}

// Rate limiting - one request per second as per Nominatim usage policy
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

export const LocationInput: React.FC<LocationInputProps> = ({ label, value, onChange }) => {
  const [error, setError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(value.address);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value.address);
  }, [value.address]);

  const handleSearch = async (address: string) => {
    if (!address.trim()) {
      return;
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ELD-Trip-Planner/1.0',
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const newLocation = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name
        };
        
        // Only update if the coordinates actually changed
        if (newLocation.lat !== value.lat || newLocation.lng !== value.lng) {
          onChange(newLocation);
          setInputValue(data[0].display_name);
        }
      } else {
        setError('No location found. Please try a different search.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError('Error searching location. Please try again.');
      console.error('Error searching location:', errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search with proper cleanup
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      
      return (address: string) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          timeoutId = null;
          handleSearch(address);
        }, 750); // Increased debounce time to 750ms for better UX
      };
    })(),
    [] // Empty dependency array since we don't use any props in the callback
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setInputValue(newAddress);
    
    // Only update the address part immediately
    onChange({ ...value, address: newAddress });
    
    if (newAddress.trim()) {
      debouncedSearch(newAddress);
    } else {
      setError('');
    }
  };

  return (
    <div className="relative space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={`w-full pl-10 pr-4 py-2 border rounded-md transition-colors duration-200 focus:ring-2 focus:ring-opacity-50 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }`}
          placeholder="Enter address..."
        />
        <Search 
          className={`absolute left-3 top-2.5 h-5 w-5 transition-colors duration-200 ${
            isSearching ? 'text-blue-400 animate-pulse' : 'text-gray-400'
          }`} 
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
      {isSearching && (
        <p className="text-sm text-blue-600" role="status">Searching...</p>
      )}
    </div>
  );
}