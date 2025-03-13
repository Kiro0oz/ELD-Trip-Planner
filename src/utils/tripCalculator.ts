import { addHours } from 'date-fns';
import { Location, RouteSegment, TripPlan, LogEntry } from '../types';

const AVERAGE_SPEED = 55; // mph
const LOADING_TIME = 1; // hour
const UNLOADING_TIME = 1; // hour
const MAX_DRIVING_TIME = 11; // hours
const MAX_ON_DUTY_TIME = 14; // hours
const REQUIRED_BREAK_TIME = 0.5; // 30 minutes
const REQUIRED_REST_TIME = 10; // hours
const MAX_DRIVING_BEFORE_BREAK = 8; // hours - updated to match regulations
const MAX_CYCLE_HOURS = 70; // 70-hour limit in 8 days
const WORKING_START_HOUR = 1; // Start at 1:00 AM

// Haversine formula
export function calculateDistance(from: Location, to: Location): number {
  const R = 3959; // Earth's radius in miles
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

export function calculateTripPlan(
  currentLocation: Location,
  pickupLocation: Location,
  dropoffLocation: Location,
  currentCycleHours: number
): TripPlan {
  const segments: RouteSegment[] = [];
  let totalDistance = calculateDistance(pickupLocation, dropoffLocation);
  let remainingCycleHours = MAX_CYCLE_HOURS - currentCycleHours;

  let drivingTime = 0;
  let onDutyTime = currentCycleHours;
  let totalDuration = 0;
  let requiredBreaks = 0;
  let requiredRests = 0;
  let accumulatedDrivingMiles = 0; // Track distance for fuel stops

  // Ensure driver is within 70-hour limit
  if (remainingCycleHours <= 0) {
    segments.push({ from: currentLocation, to: currentLocation, distance: 0, duration: REQUIRED_REST_TIME, type: 'rest' });
    requiredRests++;
    totalDuration += REQUIRED_REST_TIME;
    remainingCycleHours = MAX_CYCLE_HOURS;
    onDutyTime = 0;
  }

  // Pickup Time
  segments.push({ from: pickupLocation, to: pickupLocation, distance: 0, duration: LOADING_TIME, type: 'load' });
  onDutyTime += LOADING_TIME;
  totalDuration += LOADING_TIME;

  // Drive with breaks/rests
  let remainingDistance = totalDistance;
  while (remainingDistance > 0) {
    let driveSegment = Math.min(
      remainingDistance / AVERAGE_SPEED, 
      MAX_DRIVING_BEFORE_BREAK - drivingTime
    );

    if (driveSegment <= 0) break;

    const segmentDistance = driveSegment * AVERAGE_SPEED;
    remainingDistance -= segmentDistance;
    accumulatedDrivingMiles += segmentDistance; // Track miles for fuel stop

    // Add driving segment
    segments.push({ 
      from: pickupLocation, 
      to: dropoffLocation, 
      distance: segmentDistance, 
      duration: driveSegment, 
      type: 'drive' 
    });

    drivingTime += driveSegment;
    onDutyTime += driveSegment;
    totalDuration += driveSegment;

    // **Check for fuel stop (every 1000 miles)**
    if (accumulatedDrivingMiles >= 1000) {
      segments.push({ 
        from: dropoffLocation, 
        to: dropoffLocation, 
        distance: 0, 
        duration: 0.25, // Assuming fuel stop takes 15 mins
        type: 'fuel' 
      });
      accumulatedDrivingMiles = 0; // Reset fuel counter
    }

    // Check for required break (every 8 hours)
    if (drivingTime >= MAX_DRIVING_BEFORE_BREAK) {
      segments.push({ from: dropoffLocation, to: dropoffLocation, distance: 0, duration: REQUIRED_BREAK_TIME, type: 'break' });
      totalDuration += REQUIRED_BREAK_TIME;
      requiredBreaks++;
      drivingTime = 0; 
    }

    if (drivingTime >= MAX_DRIVING_TIME) {
      segments.push({ 
        from: dropoffLocation, 
        to: dropoffLocation, 
        distance: 0, 
        duration: REQUIRED_REST_TIME, 
        type: 'rest' 
      });
      requiredRests++;
      totalDuration += REQUIRED_REST_TIME;
      drivingTime = 0;
    }

    if (onDutyTime >= MAX_ON_DUTY_TIME) {
      segments.push({ from: dropoffLocation, to: dropoffLocation, distance: 0, duration: REQUIRED_REST_TIME, type: 'rest' });
      requiredRests++;
      totalDuration += REQUIRED_REST_TIME;
      onDutyTime = 0; 
    }
  }

  // Drop-off Time
  segments.push({ from: dropoffLocation, to: dropoffLocation, distance: 0, duration: UNLOADING_TIME, type: 'unload' });
  onDutyTime += UNLOADING_TIME;
  totalDuration += UNLOADING_TIME;

  return { segments, totalDistance, totalDuration, requiredBreaks, requiredRests };
}

export function generateELDEntries(tripPlan: TripPlan, dayIndex: number = 0): LogEntry[] {
  const entries: LogEntry[] = [];
  const startTime = new Date();
  startTime.setHours(WORKING_START_HOUR, 0, 0, 0);
  startTime.setDate(startTime.getDate() + dayIndex);
  
  let currentTime = new Date(startTime);
  const dayEnd = new Date(startTime);
  dayEnd.setHours(24, 0, 0, 0);

  // Filter segments for the current day
  const hoursPerDay = 24;
  const startHour = dayIndex * hoursPerDay;
  const endHour = (dayIndex + 1) * hoursPerDay;
  
  let accumulatedDuration = 0;
  
  for (const segment of tripPlan.segments) {
    // Skip segments before current day
    if (accumulatedDuration + segment.duration <= startHour) {
      accumulatedDuration += segment.duration;
      continue;
    }
    
    // Stop if we've passed the current day
    if (accumulatedDuration >= endHour) break;
    
    const segmentStartTime = new Date(currentTime);
    const segmentEndTime = addHours(currentTime, segment.duration);
    
    if (segmentEndTime > dayEnd) break;
    
    const entry: LogEntry = {
      startTime: segmentStartTime,
      endTime: segmentEndTime,
      location: segment.from.address || 'Unknown location',
      status: getStatusForSegmentType(segment.type)
    };
    
    entries.push(entry);
    currentTime = segmentEndTime;
    accumulatedDuration += segment.duration;
  }
  
  // If there's remaining time in the day, add off-duty time
  if (currentTime < dayEnd && entries.length > 0) {
    entries.push({
      startTime: currentTime,
      endTime: dayEnd,
      location: entries[entries.length - 1].location,
      status: 'off-duty'
    });
  }
  
  return entries;
}


function getStatusForSegmentType(type: RouteSegment['type']): LogEntry['status'] {
  switch (type) {
    case 'drive':
      return 'driving';
    case 'load':
    case 'unload':
      return 'on-duty';
    case 'break':
      return 'off-duty';
    case 'rest':
      return 'sleeper';
    default:
      return 'off-duty';
  }
}

