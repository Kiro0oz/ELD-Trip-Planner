interface TripPlan {
  totalDistance: number;
  totalDuration: number;
  requiredBreaks: number;
  requiredRests: number;
}

const TripSummary: React.FC<{ tripPlan: TripPlan }> = ({ tripPlan }) => {
  return (
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
  );
};

export default TripSummary;