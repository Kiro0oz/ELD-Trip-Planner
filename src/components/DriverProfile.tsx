import React from 'react';
import { Driver, TripHistory } from '../types';
import { Download, User, Phone, Mail, Building, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface DriverProfileProps {
  driver: Driver;
  tripHistory: TripHistory[];
  onDownloadReport: (tripId: string) => void;
}

export const DriverProfile: React.FC<DriverProfileProps> = ({
  driver,
  tripHistory,
  onDownloadReport
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Driver Info */}
      <div className="flex items-start space-x-6">
        <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-gray-600">
              <CreditCard className="w-5 h-5 mr-2" />
              <span>License: {driver.licenseNumber}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Building className="w-5 h-5 mr-2" />
              <span>Company: {driver.company}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-2" />
              <span>{driver.phoneNumber}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2" />
              <span>{driver.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip History */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Trip History</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tripHistory.map((trip) => (
                <tr key={trip.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(trip.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {trip.startLocation.address} → {trip.endLocation.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(trip.distance)} miles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(trip.duration)} hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trip.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : trip.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onDownloadReport(trip.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};