import { useEffect, useState } from 'react';
import { DriverProfile } from '../components/DriverProfile';
import { Driver, TripHistory } from '../types';
import { useAuth } from '../context/AuthContext';
import { driverInfo ,driverTripHistory  } from '../API/Endpoints/Endpoints';
import { DOMAIN } from '../API/Config';


export function ProfilePage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        if (token) {
          const driverData = await driverInfo(token);
          setDriver(driverData);

          // Fetch trip history after getting driver ID
          if (driverData?.id) {
            const trips = await driverTripHistory(token, driverData.id);
            setTripHistory(trips || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
      }
    };

    fetchDriverData();
  }, [token]);
  
  if (!driver) {
    return <div>Loading driver info...</div>;
  }

  const handleDownloadReport = async (event: React.MouseEvent, tripId: number) => {
    event.preventDefault(); 
  
    const trip = tripHistory.find((t) => t.id === tripId);
    if (trip && trip.report_url) {
      try {
        const cleanedUrl = trip.report_url.replace(/\\/g, "/"); 
        const fullUrl = `${DOMAIN}${cleanedUrl}`;
  
        const response = await fetch(fullUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to download report");
        }
  
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
  
        // Create a hidden link element to trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `trip-report-${tripId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading report:", error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DriverProfile
        driver={driver}
        tripHistory={tripHistory}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
}