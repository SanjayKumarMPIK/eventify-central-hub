
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Event Interface
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  total_slots: number;
  available_slots: number;
  image: string;
  department: string;
  created_by: string;
}

// Registration Interface
interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  team_name: string;
  created_at: string;
  teamMembers: TeamMember[];
}

interface TeamMember {
  id?: string;
  registration_id?: string;
  name: string;
  department: string;
  email?: string;
}

interface EventsContextType {
  events: Event[];
  registrations: EventRegistration[];
  addEvent: (event: Omit<Event, "id" | "created_by">) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, teamName: string, teamMembers: Omit<TeamMember, "id" | "registration_id">[]) => Promise<void>;
  getUserRegistrations: (userId: string) => Promise<EventRegistration[]>;
  getEventById: (id: string) => Event | undefined;
  getRegistrationsByEventId: (eventId: string) => Promise<EventRegistration[]>;
  increaseEventSlots: (id: string, additionalSlots: number) => Promise<void>;
  isUserRegisteredForEvent: (userId: string, eventId: string) => Promise<boolean>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const { toast } = useToast();

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  };

  const addEvent = async (event: Omit<Event, "id" | "created_by">) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, created_by: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      setEvents([...events, data]);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updatedEvent)
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.map(event => 
        event.id === id ? { ...event, ...updatedEvent } : event
      ));
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      setRegistrations(registrations.filter(reg => reg.event_id !== id));
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerForEvent = async (
    eventId: string,
    teamName: string,
    teamMembers: Omit<TeamMember, "id" | "registration_id">[]
  ) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Start a transaction by using multiple mutations
      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userData.user.id,
          team_name: teamName
        }])
        .select()
        .single();

      if (regError) throw regError;

      // Insert team members
      const { error: teamError } = await supabase
        .from('team_members')
        .insert(
          teamMembers.map(member => ({
            ...member,
            registration_id: registration.id
          }))
        );

      if (teamError) throw teamError;

      toast({
        title: "Success",
        description: "Successfully registered for the event",
      });

      // Refresh registrations
      const updatedRegistrations = await getUserRegistrations(userData.user.id);
      setRegistrations(updatedRegistrations);

    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUserRegistrations = async (userId: string): Promise<EventRegistration[]> => {
    try {
      const { data: registrationsData, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          teamMembers:team_members(*)
        `)
        .eq('user_id', userId);

      if (regError) throw regError;
      return registrationsData || [];
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw error;
    }
  };

  const getEventById = (id: string) => {
    return events.find((event) => event.id === id);
  };

  const getRegistrationsByEventId = async (eventId: string): Promise<EventRegistration[]> => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          teamMembers:team_members(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  };

  const increaseEventSlots = async (id: string, additionalSlots: number) => {
    try {
      const event = events.find((e) => e.id === id);
      if (!event) throw new Error("Event not found");

      const { error } = await supabase
        .from('events')
        .update({ 
          total_slots: event.total_slots + additionalSlots,
          available_slots: event.available_slots + additionalSlots
        })
        .eq('id', id);

      if (error) throw error;

      setEvents(events.map(event => {
        if (event.id === id) {
          return {
            ...event,
            total_slots: event.total_slots + additionalSlots,
            available_slots: event.available_slots + additionalSlots
          };
        }
        return event;
      }));

      toast({
        title: "Success",
        description: `Added ${additionalSlots} slots to the event`,
      });
    } catch (error) {
      console.error('Error increasing event slots:', error);
      toast({
        title: "Error",
        description: "Failed to increase event slots",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isUserRegisteredForEvent = async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        registrations,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        getUserRegistrations,
        getEventById,
        getRegistrationsByEventId,
        increaseEventSlots,
        isUserRegisteredForEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
