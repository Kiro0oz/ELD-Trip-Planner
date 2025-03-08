import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { TripHistory, LogEntry } from '../types';

export function generateTripReport(trip: TripHistory) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Trip Report', 14, 20);
  
  // Trip Details
  doc.setFontSize(12);
  doc.text(`Date: ${format(trip.date, 'MMM dd, yyyy')}`, 14, 30);
  doc.text(`From: ${trip.startLocation.address}`, 14, 40);
  doc.text(`To: ${trip.endLocation.address}`, 14, 50);
  doc.text(`Distance: ${Math.round(trip.distance)} miles`, 14, 60);
  doc.text(`Duration: ${Math.round(trip.duration)} hours`, 14, 70);
  
  // Daily Logs Table
  trip.logs.forEach((log, index) => {
    const tableData = log.entries.map((entry: LogEntry) => [
      format(entry.startTime, 'HH:mm'),
      format(entry.endTime, 'HH:mm'),
      entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
      entry.location
    ]);
    
    autoTable(doc, {
      startY: index === 0 ? 80 : doc.previousAutoTable.finalY + 10,
      head: [['Start Time', 'End Time', 'Status', 'Location']],
      body: tableData,
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 10 },
      beforePageContent: () => {
        doc.text(`Daily Log - ${format(log.date, 'MMM dd, yyyy')}`, 14, doc.previousAutoTable.finalY + 5);
      }
    });
    
    // Add total hours summary
    const totalHoursY = doc.previousAutoTable.finalY + 10;
    doc.text('Total Hours:', 14, totalHoursY);
    doc.text(`Driving: ${log.totalHours.driving.toFixed(1)}h`, 14, totalHoursY + 7);
    doc.text(`On Duty: ${log.totalHours.onDuty.toFixed(1)}h`, 70, totalHoursY + 7);
    doc.text(`Off Duty: ${log.totalHours.offDuty.toFixed(1)}h`, 126, totalHoursY + 7);
    doc.text(`Sleeper: ${log.totalHours.sleeper.toFixed(1)}h`, 182, totalHoursY + 7);
  });
  
  return doc;
}