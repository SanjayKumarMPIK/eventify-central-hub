
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define types
export interface Event {
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

export interface TeamMember {
  name: string;
  department: string;
  email?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  teamName: string;
  teamMembers: TeamMember[];
  registrationDate: string;
}

interface EventContextType {
  events: Event[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  increaseEventSlots: (id: string, additionalSlots: number) => Promise<void>;
  registerForEvent: (eventId: string, userId: string, teamName: string, teamMembers: TeamMember[]) => Promise<void>;
  isUserRegisteredForEvent: (userId: string, eventId: string) => Promise<boolean>;
  getUserRegistrations: (userId: string) => Promise<EventRegistration[]>;
  getRegistrationsByEventId: (eventId: string) => Promise<any[]>;
}

const EventsContext = createContext<EventContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("events").select("*");

      if (error) {
        throw error;
      }

      // Map the data to our Event type
      const eventsData: Event[] = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        department: event.department,
        image: event.image,
        total_slots: event.total_slots,
        available_slots: event.available_slots,
      }));

      setEvents(eventsData);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get event by ID
  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  // Function to add a new event
  const addEvent = async (event: Omit<Event, "id">) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            total_slots: event.total_slots,
            available_slots: event.total_slots,
            image: event.image,
            department: event.department,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setEvents((prevEvents) => [...prevEvents, data]);
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an event
  const deleteEvent = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setEvents(events.filter(event => event.id !== id));
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to increase event slots
  const increaseEventSlots = async (id: string, additionalSlots: number) => {
    setLoading(true);
    try {
      // Get the current event
      const event = events.find(e => e.id === id);
      if (!event) throw new Error("Event not found");

      const newTotalSlots = event.total_slots + additionalSlots;

      const { error } = await supabase
        .from("events")
        .update({ 
          total_slots: newTotalSlots,
          available_slots: event.available_slots + additionalSlots 
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setEvents(events.map(e => 
        e.id === id 
          ? { 
              ...e, 
              total_slots: newTotalSlots,
              available_slots: e.available_slots + additionalSlots 
            } 
          : e
      ));

      toast({
        title: "Success",
        description: `Added ${additionalSlots} slots to the event`,
      });
    } catch (error: any) {
      console.error("Error increasing event slots:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to increase slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to register for an event
  const registerForEvent = async (
    eventId: string,
    userId: string,
    teamName: string,
    teamMembers: TeamMember[]
  ) => {
    setLoading(true);
    try {
      // Insert registration
      const { data: registrationData, error: registrationError } =
        await supabase
          .from("event_registrations")
          .insert([{ event_id: eventId, user_id: userId, team_name: teamName }])
          .select()
          .single();

      if (registrationError) {
        throw registrationError;
      }

      // Insert team members with registration ID
      const teamMembersToInsert = teamMembers.map((member) => ({
        registration_id: registrationData.id,
        name: member.name,
        department: member.department,
        email: member.email,
      }));

      const { error: teamMembersError } = await supabase
        .from("team_members")
        .insert(teamMembersToInsert);

      if (teamMembersError) {
        throw teamMembersError;
      }

      // Update events state with reduced available slots
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, available_slots: event.available_slots - 1 }
            : event
        )
      );

      toast({
        title: "Success",
        description: "Registration successful",
      });

      // Refresh user registrations
      if (user) {
        await fetchUserRegistrations(user.id);
      }
    } catch (error: any) {
      console.error("Error registering for event:", error);
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a user is registered for an event
  const isUserRegisteredForEvent = async (userId: string, eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", userId)
        .eq("event_id", eventId);

      if (error) {
        throw error;
      }

      return data && data.length > 0;
    } catch (error: any) {
      console.error("Error checking registration:", error);
      return false;
    }
  };

  // Function to get user registrations
  const getUserRegistrations = async (userId: string): Promise<EventRegistration[]> => {
    try {
      // Fetch registrations
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", userId);

      if (regError) {
        throw regError;
      }

      // Fetch team members for each registration
      const registrationsWithTeamMembers = await Promise.all(
        registrations.map(async (reg) => {
          const { data: teamMembers, error: teamError } = await supabase
            .from("team_members")
            .select("*")
            .eq("registration_id", reg.id);

          if (teamError) {
            console.error("Error fetching team members:", teamError);
            return null;
          }

          return {
            id: reg.id,
            eventId: reg.event_id,
            userId: reg.user_id,
            teamName: reg.team_name,
            registrationDate: reg.registration_date,
            teamMembers: teamMembers.map((member) => ({
              name: member.name,
              department: member.department,
              email: member.email,
            })),
          };
        })
      );

      return registrationsWithTeamMembers.filter(Boolean) as EventRegistration[];
    } catch (error: any) {
      console.error("Error fetching user registrations:", error);
      return [];
    }
  };

  // Function to get registrations by event ID
  const getRegistrationsByEventId = async (eventId: string) => {
    try {
      // Fetch registrations for the event
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId);

      if (regError) {
        throw regError;
      }

      // Fetch team members and user details for each registration
      const detailedRegistrations = await Promise.all(
        registrations.map(async (reg) => {
          // Get team members
          const { data: teamMembers, error: teamError } = await supabase
            .from("team_members")
            .select("*")
            .eq("registration_id", reg.id);

          if (teamError) {
            console.error("Error fetching team members:", teamError);
            return null;
          }

          // Get user details
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", reg.user_id)
            .single();

          if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is ok
            console.error("Error fetching user details:", userError);
          }

          return {
            id: reg.id,
            eventId: reg.event_id,
            userId: reg.user_id,
            userName: userData?.name || "Unknown User",
            userEmail: userData?.email || "No email",
            teamName: reg.team_name,
            registrationDate: reg.registration_date,
            teamMembers: teamMembers || [],
          };
        })
      );

      return detailedRegistrations.filter(Boolean);
    } catch (error: any) {
      console.error("Error fetching event registrations:", error);
      return [];
    }
  };

  // Fetch events when the context is first used
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        fetchEvents,
        getEventById,
        addEvent,
        deleteEvent,
        increaseEventSlots,
        registerForEvent,
        isUserRegisteredForEvent,
        getUserRegistrations,
        getRegistrationsByEventId
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
