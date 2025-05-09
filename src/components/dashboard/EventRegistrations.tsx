import React, { useState, useEffect } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegistrationDetail = Database['public']['Views']['event_registration_details']['Row'];

const EventRegistrations = () => {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations(selectedEvent);
    } else {
      setRegistrations([]);
    }
  }, [selectedEvent]);

  const fetchRegistrations = async (eventId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_registration_details')
        .select('*')
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <h4 className="font-medium text-gray-600">No registrations yet</h4>
          <p className="text-gray-500 mt-2">
            {selectedEvent ? 'No one has registered for this event yet.' : 'Select an event to view registrations.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration Date</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Team Members</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.registration_id}>
                  <TableCell>
                    {format(new Date(reg.registration_date), 'MMM dd, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{reg.team_name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reg.user_name}</div>
                      <div className="text-sm text-gray-500">{reg.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {reg.team_members.map((member, index) => (
                        <div key={index} className="text-sm">
                          {member.name} ({member.department})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Registered
                    </Badge>
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
