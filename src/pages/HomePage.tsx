import { useState } from "react";
import {
  Clock,
  Crosshair,
  Plus,
  MapPin,
  Box,
  BedDouble,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LocationInput } from "../components/LocationInput";
import { TripMap } from "../components/TripMap";
import { ELDLog } from "../components/ELDLog";
import { Location, TripDetails, DailyLog, TripPlan, LogEntry } from "../types";
import { calculateTripPlan, generateELDEntries } from "../utils/tripCalculator";
import { createTrip } from "../API/Endpoints/Endpoints";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { ToastContainer } from "react-toastify";
import TripSummary from "../components/TripSummary";
import { addDays } from "date-fns";

const defaultLocation: Location = {
  lat: 0,
  lng: 0,
  address: "",
};

export function HomePage() {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    currentLocation: defaultLocation,
    pickupLocation: defaultLocation,
    dropoffLocation: defaultLocation,
    currentCycleHours: 0,
  });

  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null); // For trip summary
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [showSegments, setShowSegments] = useState(true);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ELD-Trip-Planner/1.0",
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get address");

      const data = await response.json();

      setTripDetails((prev) => ({
        ...prev,
        currentLocation: {
          lat: latitude,
          lng: longitude,
          address: data.display_name,
        },
      }));
    } catch (error) {
      console.error("Error getting location:", error);
      alert(
        "Unable to get your current location. Please ensure location services are enabled."
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddTrip = async () => {
    const {
      currentLocation,
      pickupLocation,
      dropoffLocation,
      currentCycleHours,
    } = tripDetails;

    if (currentLocation.lat && pickupLocation.lat && dropoffLocation.lat) {
      const plan = calculateTripPlan(
        currentLocation,
        pickupLocation,
        dropoffLocation,
        currentCycleHours
      );

      setTripPlan(plan);

      const totalDays = Math.ceil(plan.totalDuration / 24);
      const logs: DailyLog[] = [];

      for (let day = 0; day < totalDays; day++) {
        const dayEntries = generateELDEntries(plan, day);

        // Ensure dayEntries is an array
        if (!Array.isArray(dayEntries)) {
          console.error(
            `generateELDEntries returned invalid data:`,
            dayEntries
          );
          continue;
        }

        const totalHours = dayEntries.reduce(
          (acc, entry) => {
            const duration =
              (entry.endTime.getTime() - entry.startTime.getTime()) /
              (1000 * 60 * 60);
            const statusMapping: Record<LogEntry["status"], keyof typeof acc> =
              {
                driving: "driving",
                "on-duty": "onDuty",
                "off-duty": "offDuty",
                sleeper: "sleeper",
              };
            acc[statusMapping[entry.status]] += duration;
            return acc;
          },
          { driving: 0, onDuty: 0, offDuty: 0, sleeper: 0 }
        );

        logs.push({
          date: addDays(new Date(), day),
          entries: dayEntries,
          totalHours,
        });
      }

      setDailyLogs(logs);
      setShowResults(true);
      setShowSegments(true);
      // Get start date as the beginning of today (UTC)
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const start_date = startOfToday.toISOString();

      // Call the createTrip function
      const tripData = {
        start_location: pickupLocation.address,
        end_location: dropoffLocation.address,
        start_date,
        end_date: "2025-03-09T20:00:00Z",
        totalDistance: plan.totalDistance.toFixed(2),
        totalDuration: plan.totalDuration.toFixed(2),
        requiredBreaks: plan.requiredBreaks,
        requiredRests: plan.requiredRests,
      };

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User is not authenticated");

        await createTrip(tripData, token);
        showSuccessToast("Trip Added Successfully");
      } catch (error) {
        showErrorToast("Failed to Add Trip");
        console.error("Error creating trip:", error);
      }
    }
  };

  const isFormComplete = () => {
    const { currentLocation, pickupLocation, dropoffLocation } = tripDetails;
    return (
      currentLocation.lat !== 0 &&
      currentLocation.lng !== 0 &&
      pickupLocation.lat !== 0 &&
      pickupLocation.lng !== 0 &&
      dropoffLocation.lat !== 0 &&
      dropoffLocation.lng !== 0
    );
  };

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "drive":
        return <Truck className="w-5 h-5" />;
      case "load":
      case "unload":
        return <Box className="w-5 h-5" />;
      case "break":
        return <Clock className="w-5 h-5" />;
      case "rest":
        return <BedDouble className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "drive":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "load":
      case "unload":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "break":
        return "bg-green-50 text-green-700 border-green-200";
      case "rest":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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
                  onChange={(location) =>
                    setTripDetails((prev) => ({
                      ...prev,
                      currentLocation: location,
                    }))
                  }
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className={`absolute right-2 top-8 p-1.5  rounded-md transition-colors ${
                    isLocating
                      ? "bg-gray-100 text-gray-400"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                  title="Use current location"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
              <LocationInput
                label="Pickup Location"
                value={tripDetails.pickupLocation}
                onChange={(location) =>
                  setTripDetails((prev) => ({
                    ...prev,
                    pickupLocation: location,
                  }))
                }
              />
              <LocationInput
                label="Dropoff Location"
                value={tripDetails.dropoffLocation}
                onChange={(location) =>
                  setTripDetails((prev) => ({
                    ...prev,
                    dropoffLocation: location,
                  }))
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Cycle Hours Used
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tripDetails.currentCycleHours}
                    onChange={(e) =>
                      setTripDetails((prev) => ({
                        ...prev,
                        currentCycleHours: Math.min(
                          70,
                          Math.max(0, parseFloat(e.target.value) || 0)
                        ),
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="70"
                    step="0.5"
                  />
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={handleAddTrip}
                disabled={!isFormComplete()}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-white ${
                  isFormComplete()
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors duration-200`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Trip
              </button>
            </div>
          </div>
        </div>
        {showResults && (
          <div className="flex-1">
            <TripMap
              currentLocation={tripDetails.currentLocation}
              pickupLocation={tripDetails.pickupLocation}
              dropoffLocation={tripDetails.dropoffLocation}
            />
          </div>
        )}
      </div>

      {showResults && tripPlan && (
        <>
          <TripSummary tripPlan={tripPlan} />

          <div className="bg-white w-full mt-6 p-6 rounded-lg shadow-lg">
            <button
              onClick={() => setShowSegments(!showSegments)}
              className="w-full flex items-center justify-between text-xl font-semibold mb-4 focus:outline-none"
            >
              <span>Trip Segments</span>
              {showSegments ? (
                <ChevronUp className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-500" />
              )}
            </button>
            {showSegments && (
              <div className="space-y-4">
                {tripPlan.segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSegmentColor(
                      segment.type
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getSegmentIcon(segment.type)}
                        <div>
                          <h3 className="font-semibold capitalize">
                            {segment.type === "drive"
                              ? "Driving"
                              : segment.type === "load"
                              ? "Loading"
                              : segment.type === "unload"
                              ? "Unloading"
                              : segment.type === "break"
                              ? "Break"
                              : segment.type === "rest"
                              ? "Rest Period"
                              : segment.type === "fuel"
                              ? "Fuel Stop" 
                              : "Unknown"}
                          </h3>
                          <p className="text-sm mt-1">
                            {segment.type === "drive" ? (
                              <>
                                From: {segment.from.address}
                                <br />
                                To: {segment.to.address}
                              </>
                            ) : segment.type === "fuel" ? (
                              <>Refueling at: {segment.from.address}</>
                            ) : (
                              <>Location: {segment.from.address}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {segment.distance > 0 && (
                          <p className="text-sm font-medium">
                            {Math.round(segment.distance)} miles
                          </p>
                        )}
                        <p className="text-sm font-medium">
                          {Math.round(segment.duration * 60)} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <ToastContainer />

      {showResults && (
        <div className="mt-5">
          <ELDLog logs={dailyLogs} />
        </div>
      )}
    </div>
  );
}

