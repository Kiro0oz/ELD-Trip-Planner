import { format } from "date-fns";
import { DailyLog, LogEntry } from "../types";
import { Clock, Truck, Box, BedDouble } from "lucide-react";

interface ELDLogProps {
  log: DailyLog;
  onLogUpdate?: (updatedLog: DailyLog) => void;
}

export const ELDLog: React.FC<ELDLogProps> = ({ log }) => {
  // const GRID_HEIGHT = 300;
  const HOURS_IN_DAY = 24;


  const getStatusColor = (status: LogEntry["status"]) => {
    switch (status) {
      case "driving":
        return "#22c55e";
      case "on-duty":
        return "#eab308";
      case "off-duty":
        return "#3b82f6";
      case "sleeper":
        return "#8b5cf6";
      default:
        return "#94a3b8";
    }
  };

  const getStatusIcon = (status: LogEntry["status"]) => {
    switch (status) {
      case "driving":
        return <Truck className="w-4 h-4" />;
      case "on-duty":
        return <Box className="w-4 h-4" />;
      case "off-duty":
        return <Clock className="w-4 h-4" />;
      case "sleeper":
        return <BedDouble className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Calculate total hours for each status
  const calculateTotalHours = () => {
    const totals = {
      driving: 0,
      onDuty: 0,
      offDuty: 0,
      sleeper: 0,
    };

    log.entries.forEach((entry) => {
      const duration =
        (entry.endTime.getTime() - entry.startTime.getTime()) /
        (1000 * 60 * 60);
      switch (entry.status) {
        case "driving":
          totals.driving += duration;
          break;
        case "on-duty":
          totals.onDuty += duration;
          break;
        case "off-duty":
          totals.offDuty += duration;
          break;
        case "sleeper":
          totals.sleeper += duration;
          break;
      }
    });

    return totals;
  };

  const totalHours = calculateTotalHours();

  const renderTimeGrid = () => {
    return (
      <div className="relative w-full h-[300px] border border-gray-200 rounded-lg bg-white">
        {/* Time markers */}
        <div className="absolute top-0 left-0 w-full h-6 flex">
          {Array.from({ length: HOURS_IN_DAY + 1 }).map((_, i) => (
            <div
              key={`time-${i}`}
              className="flex-1 text-xs text-gray-500 text-center border-l border-gray-200"
              style={{ marginLeft: i === 0 ? "-0.5px" : undefined }}
            >
              {i.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Vertical grid lines */}
        <div className="absolute top-6 left-0 w-full h-[calc(100%-1.5rem)] flex">
          {Array.from({ length: HOURS_IN_DAY * 4 }).map((_, i) => (
            <div
              key={`grid-${i}`}
              className={`flex-1 border-l ${
                i % 4 === 0 ? "border-gray-200" : "border-gray-100"
              }`}
            />
          ))}
        </div>

        {/* Log entries */}
        <div className="absolute top-6 left-0 w-full h-[calc(100%-1.5rem)]">
          {log.entries.map((entry, index) => {
            const startHour =
              entry.startTime.getHours() + entry.startTime.getMinutes() / 60;
            const endHour =
              entry.endTime.getHours() + entry.endTime.getMinutes() / 60;
            const startPercent = (startHour / HOURS_IN_DAY) * 100;
            const width = ((endHour - startHour) / HOURS_IN_DAY) * 100;

            return (
              <div
                key={index}
                className="absolute h-12 rounded-md flex items-center justify-center text-white text-sm transition-all"
                style={{
                  left: `${startPercent}%`,
                  width: `${width}%`,
                  backgroundColor: getStatusColor(entry.status),
                  top: "1rem",
                }}
                title={`${format(entry.startTime, "HH:mm")} - ${format(
                  entry.endTime,
                  "HH:mm"
                )}
                    ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    ${entry.location}`}
              >
                {width > 8 && getStatusIcon(entry.status)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 w-full rounded-lg shadow-lg">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Daily Log - {format(log.date, "MMM dd, yyyy")}
          </h3>
        </div>

        {renderTimeGrid()}

        <div className="grid grid-cols-4 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${getStatusColor("driving")}15` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium">Driving</span>
            </div>
            <p className="text-2xl font-semibold">
              {totalHours.driving.toFixed(1)}h
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${getStatusColor("on-duty")}15` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Box className="w-4 h-4" />
              <span className="text-sm font-medium">On Duty</span>
            </div>
            <p className="text-2xl font-semibold">
              {totalHours.onDuty.toFixed(1)}h
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${getStatusColor("off-duty")}15` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Off Duty</span>
            </div>
            <p className="text-2xl font-semibold">
              {totalHours.offDuty.toFixed(1)}h
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${getStatusColor("sleeper")}15` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BedDouble className="w-4 h-4" />
              <span className="text-sm font-medium">Sleeper</span>
            </div>
            <p className="text-2xl font-semibold">
              {totalHours.sleeper.toFixed(1)}h
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">HOS Regulations</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Maximum 11 hours driving time</li>
            <li>• Maximum 14 hours on duty</li>
            <li>• Required 30-minute break after 8 hours driving</li>
            <li>• 10-hour rest period between shifts</li>
            <li>• 70-hour limit in 8 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
