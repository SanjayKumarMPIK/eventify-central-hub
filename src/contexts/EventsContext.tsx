
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
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
}

// Registration Interface
interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  teamName: string;
  teamMembers: TeamMember[];
  registrationDate: string;
}

interface TeamMember {
  name: string;
  department: string;
  email?: string;
}

interface EventsContextType {
  events: Event[];
  registrations: EventRegistration[];
  loading: boolean;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, userId: string, teamName: string, teamMembers: TeamMember[]) => Promise<void>;
  getUserRegistrations: (userId: string) => Promise<EventRegistration[]>;
  getEventById: (id: string) => Event | undefined;
  getRegistrationsByEventId: (eventId: string) => Promise<EventRegistration[]>;
  increaseEventSlots: (id: string, additionalSlots: number) => Promise<void>;
  isUserRegisteredForEvent: (userId: string, eventId: string) => Promise<boolean>;
  fetchEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch user registrations when user changes
  useEffect(() => {
    if (user) {
      fetchUserRegistrations(user.id);
    } else {
      setRegistrations([]);
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async (userId: string) => {
    try {
      // Get basic registration data
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId);
      
      if (registrationsError) {
        throw registrationsError;
      }

      if (!registrationsData || registrationsData.length === 0) {
        setRegistrations([]);
        return;
      }

      // Get team members for each registration
      const registrationsWithTeamMembers = await Promise.all(
        registrationsData.map(async (reg) => {
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('registration_id', reg.id);
          
          if (teamMembersError) {
            throw teamMembersError;
          }

          return {
            id: reg.id,
            eventId: reg.event_id,
            userId: reg.user_id,
            teamName: reg.team_name,
            registrationDate: reg.registration_date,
            teamMembers: teamMembersData || [],
          };
        })
      );

      setRegistrations(registrationsWithTeamMembers);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your registrations. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    try {
      const newEvent = {
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        total_slots: event.total_slots,
        available_slots: event.total_slots,
        image: event.image,
        department: event.department,
      };

      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      setEvents((prevEvents) => [...prevEvents, data]);
      return data;
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add event. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      // Convert to snake_case for database
      const dbEvent = {
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date,
        location: updatedEvent.location,
        total_slots: updatedEvent.total_slots,
        available_slots: updatedEvent.available_slots,
        image: updatedEvent.image,
        department: updatedEvent.department,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('events')
        .update(dbEvent)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === id) {
            return { ...event, ...data };
          }
          return event;
        })
      );
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update event. Please try again.",
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
      
      if (error) {
        throw error;
      }

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      
      // Also remove registrations for this event from local state
      setRegistrations((prevRegistrations) => 
        prevRegistrations.filter((reg) => reg.eventId !== id)
      );
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerForEvent = async (
    eventId: string,
    userId: string,
    teamName: string,
    teamMembers: TeamMember[]
  ) => {
    try {
      // Find the event
      const event = events.find((e) => e.id === eventId);
      if (!event || event.available_slots <= 0) {
        throw new Error("Event not found or no slots available");
      }

      // Check if user is already registered
      const isRegistered = await isUserRegisteredForEvent(userId, eventId);
      if (isRegistered) {
        throw new Error("You are already registered for this event");
      }

      // Create registration
      const { data: registrationData, error: registrationError } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userId,
          team_name: teamName,
        }])
        .select()
        .single();
      
      if (registrationError) {
        throw registrationError;
      }

      // Add team members
      const teamMembersToInsert = teamMembers.map(member => ({
        registration_id: registrationData.id,
        name: member.name,
        department: member.department,
        email: member.email || null
      }));

      const { error: teamMembersError } = await supabase
        .from('team_members')
        .insert(teamMembersToInsert);
      
      if (teamMembersError) {
        throw teamMembersError;
      }

      // Refresh events to get updated available slots
      await fetchEvents();
      
      // Refresh user registrations
      if (user) {
        await fetchUserRegistrations(user.id);
      }

      return registrationData;
    } catch (error: any) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Failed",
        description: error?.message || "Failed to register for event. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUserRegistrations = async (userId: string) => {
    try {
      // Get basic registration data
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId);
      
      if (registrationsError) {
        throw registrationsError;
      }

      if (!registrationsData || registrationsData.length === 0) {
        return [];
      }

      // Get team members for each registration
      const registrationsWithTeamMembers = await Promise.all(
        registrationsData.map(async (reg) => {
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('registration_id', reg.id);
          
          if (teamMembersError) {
            throw teamMembersError;
          }

          return {
            id: reg.id,
            eventId: reg.event_id,
            userId: reg.user_id,
            teamName: reg.team_name,
            registrationDate: reg.registration_date,
            teamMembers: teamMembersData || [],
          };
        })
      );

      return registrationsWithTeamMembers;
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      throw error;
    }
  };

  const getEventById = (id: string) => {
    return events.find((event) => event.id === id);
  };

  const getRegistrationsByEventId = async (eventId: string) => {
    try {
      // Get registrations for this event
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId);
      
      if (registrationsError) {
        throw registrationsError;
      }

      if (!registrationsData || registrationsData.length === 0) {
        return [];
      }

      // Get team members for each registration
      const registrationsWithTeamMembers = await Promise.all(
        registrationsData.map(async (reg) => {
          const { data: teamMembersData, error: teamMembersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('registration_id', reg.id);
          
          if (teamMembersError) {
            throw teamMembersError;
          }

          return {
            id: reg.id,
            eventId: reg.event_id,
            userId: reg.user_id,
            teamName: reg.team_name,
            registrationDate: reg.registration_date,
            teamMembers: teamMembersData || [],
          };
        })
      );

      return registrationsWithTeamMembers;
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      throw error;
    }
  };

  const increaseEventSlots = async (id: string, additionalSlots: number) => {
    try {
      const event = events.find((e) => e.id === id);
      if (!event) {
        throw new Error("Event not found");
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          total_slots: event.total_slots + additionalSlots,
          available_slots: event.available_slots + additionalSlots,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === id) {
            return { 
              ...event, 
              total_slots: data.total_slots,
              available_slots: data.available_slots
            };
          }
          return event;
        })
      );
    } catch (error: any) {
      console.error("Error increasing event slots:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to increase event slots. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isUserRegisteredForEvent = async (userId: string, eventId: string) => {
    try {
      const { data, error, count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('event_id', eventId);
      
      if (error) {
        throw error;
      }

      return count !== null && count > 0;
    } catch (error) {
      console.error("Error checking registration status:", error);
      throw error;
    }
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        registrations,
        loading,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        getUserRegistrations,
        getEventById,
        getRegistrationsByEventId,
        increaseEventSlots,
        isUserRegisteredForEvent,
        fetchEvents,
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
