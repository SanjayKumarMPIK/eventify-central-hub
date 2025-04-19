
import React, { useEffect, useState } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface EventRegistrationsProps {
  selectedEvent: string | null;
  setSelectedEvent: (id: string | null) => void;
}

const EventRegistrations = ({ selectedEvent, setSelectedEvent }: EventRegistrationsProps) => {
  const { events, getRegistrationsByEventId } = useEvents();
  const [registrations, setRegistrations] = useState<any[]>([]);
  
  useEffect(() => {
    if (selectedEvent) {
      const eventRegistrations = getRegistrationsByEventId(selectedEvent);
      setRegistrations(eventRegistrations);
    } else if (events.length > 0) {
      // If no event is selected, show the first event's registrations
      setSelectedEvent(events[0].id);
    }
  }, [selectedEvent, events, getRegistrationsByEventId, setSelectedEvent]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-medium text-gray-600">No events available</h3>
        <p className="text-gray-500 mt-2">
          Create an event first to manage registrations.
        </p>
      </div>
    );
  }

  const selectedEventObj = events.find(e => e.id === selectedEvent);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Event Registrations</h2>
          <p className="text-gray-600">View and manage participant registrations</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select 
            value={selectedEvent || ''} 
            onValueChange={(value) => setSelectedEvent(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedEventObj && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium">{selectedEventObj.title}</h3>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <span className="text-gray-500">Date:</span>{' '}
              {format(new Date(selectedEventObj.date), 'MMMM dd, yyyy')}
            </div>
            <div>
              <span className="text-gray-500">Time:</span>{' '}
              {format(new Date(selectedEventObj.date), 'h:mm a')}
            </div>
            <div>
              <span className="text-gray-500">Total Registrations:</span>{' '}
              {registrations.length}
            </div>
            <div>
              <span className="text-gray-500">Available Slots:</span>{' '}
              {selectedEventObj.availableSlots} of {selectedEventObj.totalSlots}
            </div>
          </div>
        </div>
      )}
      
      {registrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-600">No registrations yet</h3>
          <p className="text-gray-500 mt-2">
            There are no participants registered for this event.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableCaption>List of all registered participants</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.teamName}</TableCell>
                  <TableCell>
                    {format(new Date(reg.registrationDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{reg.teamMembers.length} members</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
