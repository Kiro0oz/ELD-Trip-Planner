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
  name: string;
  licenseNumber: string;
  company: string;
  phoneNumber: string;
  email: string;
  photo?: string;
}

export interface TripHistory {
  id: string;
  driverId: string;
  date: Date;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  status: 'completed' | 'in-progress' | 'planned';
  logs: DailyLog[];
}