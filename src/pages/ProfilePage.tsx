import { DriverProfile } from '../components/DriverProfile';
import { generateTripReport } from '../utils/reportGenerator';

// Sample driver data
const sampleDriver = {
  id: '1',
  name: 'John Doe',
  licenseNumber: 'CDL123456',
  company: 'Express Logistics',
  phoneNumber: '(555) 123-4567',
  email: 'john.doe@expresslogistics.com',
  photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'
};

const sampleTripHistory = [
  {
    id: '1',
    driverId: '1',
    date: new Date('2024-03-10'),
    startLocation: {
      lat: 34.0522,
      lng: -118.2437,
      address: 'Los Angeles, CA'
    },
    endLocation: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA'
    },
    distance: 382,
    duration: 6.5,
    status: 'completed',
    logs: []
  },
  {
    id: '2',
    driverId: '1',
    date: new Date('2024-03-08'),
    startLocation: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA'
    },
    endLocation: {
      lat: 47.6062,
      lng: -122.3321,
      address: 'Seattle, WA'
    },
    distance: 808,
    duration: 12.5,
    status: 'completed',
    logs: []
  }
];

export function ProfilePage() {
  const handleDownloadReport = (tripId: string) => {
    const trip = sampleTripHistory.find(t => t.id === tripId);
    if (trip) {
      const doc = generateTripReport(trip);
      doc.save(`trip-report-${tripId}.pdf`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DriverProfile
        driver={sampleDriver}
        tripHistory={sampleTripHistory}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
}