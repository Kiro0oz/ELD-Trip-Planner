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
}

export interface TripPlan {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  requiredBreaks: number;
  requiredRests: number;
}