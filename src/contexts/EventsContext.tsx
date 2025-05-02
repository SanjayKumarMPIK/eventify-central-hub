
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Event, EventRegistration, TeamMember } from '@/types/event.types';
import * as eventService from '@/services/eventService';
import * as registrationService from '@/services/registrationService';

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
      console.log("EventsContext: Fetching events...");
      const eventsData = await eventService.fetchEvents();
      console.log("EventsContext: Events fetched:", eventsData.length);
      setEvents(eventsData);
    } catch (error: any) {
      console.error("EventsContext: Error fetching events:", error);
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
      const newEvent = await eventService.addEvent(event);
      if (newEvent) {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
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
      const success = await eventService.deleteEvent(id);
      if (success) {
        setEvents(events.filter(event => event.id !== id));
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
      }
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
      const updatedEvent = await eventService.increaseEventSlots(id, additionalSlots);
      if (updatedEvent) {
        setEvents(events.map(e => e.id === id ? updatedEvent : e));
        toast({
          title: "Success",
          description: `Added ${additionalSlots} slots to the event`,
        });
      }
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
      const success = await registrationService.registerForEvent(eventId, userId, teamName, teamMembers);
      if (success) {
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

        if (user) {
          await getUserRegistrations(user.id);
        }
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
    return registrationService.isUserRegisteredForEvent(userId, eventId);
  };

  // Function to get user registrations
  const getUserRegistrations = async (userId: string): Promise<EventRegistration[]> => {
    return registrationService.getUserRegistrations(userId);
  };

  // Function to get registrations by event ID
  const getRegistrationsByEventId = async (eventId: string) => {
    return registrationService.getRegistrationsByEventId(eventId);
  };

  // Fetch events when the context is first used
  useEffect(() => {
    console.log("EventsContext: Initial fetch");
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
