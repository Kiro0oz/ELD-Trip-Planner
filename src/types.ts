import { LatLngTuple } from 'leaflet';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface TripDetails {
  currentLocation: Location;
  pickupLocation: Location;
  dropoffLocation: Location;
  currentCycleHours: number;
}

export interface LogEntry {
  status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper';
  startTime: Date;
  endTime: Date;
  location: string;
}

export interface DailyLog {
  date: Date;
  entries: LogEntry[];
  totalHours: {
    driving: number;
    onDuty: number;
    offDuty: number;
    sleeper: number;
  };
}

export interface RouteSegment {
  from: Location;
  to: Location;
  distance: number; // in miles
  duration: number; // in hours
  type: 'drive' | 'load' | 'unload' | 'break' | 'rest';
  waypoints?: LatLngTuple[];
  gasStops?: Location[];
}

export interface TripPlan {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  requiredBreaks: number;
  requiredRests: number;
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  email: string;
  photo?: string;
}

export interface TripHistory {
  id: number;
  driverId: string;
  start_date: Date;
  end_date: Date;
  report_url: string;
  start_location: string;
  end_location: string;
  totalDistance: number;
  totalDuration: number;
  status: 'completed' | 'in-progress' | 'planned';
  logs: DailyLog[];
}