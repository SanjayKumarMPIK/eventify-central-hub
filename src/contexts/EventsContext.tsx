import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

// Event Interface
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
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
  getUserRegistrations: (userId: string) => EventRegistration[];
  getEventById: (id: string) => Event | undefined;
  getRegistrationsByEventId: (eventId: string) => EventRegistration[];
  increaseEventSlots: (id: string, additionalSlots: number) => Promise<void>;
  isUserRegisteredForEvent: (userId: string, eventId: string) => boolean;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();

    // Subscribe to real-time updates for events
    const eventsSubscription = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setEvents(prevEvents =>
              prevEvents.map(event =>
                event.id === payload.new.id
                  ? {
                      ...event,
                      availableSlots: payload.new.available_slots,
                      totalSlots: payload.new.total_slots
                    }
                  : event
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*");

      if (eventsError) throw eventsError;

      const formattedEvents = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        location: event.location || "",
        totalSlots: event.total_slots,
        availableSlots: event.available_slots,
        image: event.image || "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
        department: event.department || "General",
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  const fetchRegistrations = async () => {
    if (!user) {
      setRegistrations([]);
      return;
    }

    try {
      // Fetch registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("event_registrations")
        .select("*");

      if (registrationsError) throw registrationsError;

      // Fetch team members for each registration
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from("team_members")
        .select("*");

      if (teamMembersError) throw teamMembersError;

      // Map team members to their registrations
      const registrationsWithTeamMembers: EventRegistration[] = registrationsData.map((reg) => {
        const teamMembers = teamMembersData
          .filter((member) => member.registration_id === reg.id)
          .map((member) => ({
            name: member.name,
            department: member.department,
            email: member.email || undefined,
          }));

        return {
          id: reg.id,
          eventId: reg.event_id,
          userId: reg.user_id,
          teamName: reg.team_name,
          teamMembers,
          registrationDate: reg.registration_date,
        };
      });

      setRegistrations(registrationsWithTeamMembers);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error;
    }
  };

  const refreshEvents = async () => {
    try {
      await fetchEvents();
      return;
    } catch (error) {
      console.error("Error refreshing events:", error);
      throw error;
    }
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            total_slots: event.totalSlots,
            available_slots: event.availableSlots,
            image: event.image,
            department: event.department,
          },
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new event to the state
        const newEvent: Event = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || "",
          date: data[0].date,
          location: data[0].location || "",
          totalSlots: data[0].total_slots,
          availableSlots: data[0].available_slots,
          image: data[0].image || "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
          department: data[0].department || "General",
        };
        
        setEvents((prev) => [...prev, newEvent]);
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error adding event",
        description: "Failed to add the event to the database",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      // Convert to database format
      const dbUpdateData: any = {};
      if (updatedEvent.title !== undefined) dbUpdateData.title = updatedEvent.title;
      if (updatedEvent.description !== undefined) dbUpdateData.description = updatedEvent.description;
      if (updatedEvent.date !== undefined) dbUpdateData.date = updatedEvent.date;
      if (updatedEvent.location !== undefined) dbUpdateData.location = updatedEvent.location;
      if (updatedEvent.totalSlots !== undefined) dbUpdateData.total_slots = updatedEvent.totalSlots;
      if (updatedEvent.availableSlots !== undefined) dbUpdateData.available_slots = updatedEvent.availableSlots;
      if (updatedEvent.image !== undefined) dbUpdateData.image = updatedEvent.image;
      if (updatedEvent.department !== undefined) dbUpdateData.department = updatedEvent.department;

      const { error } = await supabase
        .from("events")
        .update(dbUpdateData)
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === id) {
            return { ...event, ...updatedEvent };
          }
          return event;
        })
      );
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error updating event",
        description: "Failed to update the event in the database",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      
      // Also remove registrations for this event from local state
      setRegistrations((prevRegistrations) => 
        prevRegistrations.filter((reg) => reg.eventId !== id)
      );
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event",
        description: "Failed to delete the event from the database",
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
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user is already registered
      if (isUserRegisteredForEvent(userId, eventId)) {
        throw new Error("You are already registered for this event");
      }

      // Start a transaction
      const { data: regData, error: regError } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            team_name: teamName,
            registration_date: new Date().toISOString(),
          },
        ])
        .select();

      if (regError) {
        if (regError.message.includes('No slots available')) {
          throw new Error("Registration failed: No slots available");
        }
        throw regError;
      }

      if (!regData || regData.length === 0) {
        throw new Error("Failed to create registration");
      }

      const registrationId = regData[0].id;

      // Insert team members
      const teamMembersToInsert = teamMembers.map((member) => ({
        registration_id: registrationId,
        name: member.name,
        department: member.department,
        email: member.email || null,
      }));

      const { error: teamError } = await supabase
        .from("team_members")
        .insert(teamMembersToInsert);

      if (teamError) throw teamError;

      // Create new registration for local state
      const newRegistration: EventRegistration = {
        id: registrationId,
        eventId,
        userId,
        teamName,
        teamMembers,
        registrationDate: new Date().toISOString(),
      };

      setRegistrations((prev) => [...prev, newRegistration]);

      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the event",
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUserRegistrations = (userId: string) => {
    return registrations.filter((reg) => reg.userId === userId);
  };

  const getEventById = (id: string) => {
    return events.find((event) => event.id === id);
  };

  const getRegistrationsByEventId = (eventId: string) => {
    return registrations.filter((reg) => reg.eventId === eventId);
  };

  const increaseEventSlots = async (id: string, additionalSlots: number) => {
    try {
      const event = events.find((e) => e.id === id);
      if (!event) {
        throw new Error("Event not found");
      }

      const newTotalSlots = event.totalSlots + additionalSlots;
      const newAvailableSlots = event.availableSlots + additionalSlots;

      const { error } = await supabase
        .from("events")
        .update({
          total_slots: newTotalSlots,
          available_slots: newAvailableSlots,
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setEvents((prevEvents) =>
        prevEvents.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              totalSlots: newTotalSlots,
              availableSlots: newAvailableSlots,
            };
          }
          return e;
        })
      );
    } catch (error) {
      console.error("Error increasing event slots:", error);
      toast({
        title: "Error updating event",
        description: "Failed to increase event slots",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isUserRegisteredForEvent = (userId: string, eventId: string) => {
    return registrations.some((reg) => reg.userId === userId && reg.eventId === eventId);
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
        refreshEvents,
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
