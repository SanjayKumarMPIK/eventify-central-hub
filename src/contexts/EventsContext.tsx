
import React, { createContext, useContext, useState } from "react";

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
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, updatedEvent: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userId: string, teamName: string, teamMembers: TeamMember[]) => void;
  getUserRegistrations: (userId: string) => EventRegistration[];
  getEventById: (id: string) => Event | undefined;
  getRegistrationsByEventId: (eventId: string) => EventRegistration[];
  increaseEventSlots: (id: string, additionalSlots: number) => void;
  isUserRegisteredForEvent: (userId: string, eventId: string) => boolean;
}

// Initial sample events
const INITIAL_EVENTS: Event[] = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
    date: "2025-05-15T10:00:00",
    location: "Computer Science Building, Room 101",
    totalSlots: 30,
    availableSlots: 25,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    department: "Computer Science"
  },
  {
    id: "2",
    title: "AI and Machine Learning Conference",
    description: "Explore the latest advancements in artificial intelligence and machine learning.",
    date: "2025-05-20T09:00:00",
    location: "Engineering Hall, Auditorium",
    totalSlots: 100,
    availableSlots: 85,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    department: "Computer Science"
  },
  {
    id: "3",
    title: "Entrepreneurship Summit",
    description: "Connect with successful entrepreneurs and learn about starting your own business.",
    date: "2025-06-05T13:00:00",
    location: "Business School, Conference Room",
    totalSlots: 50,
    availableSlots: 30,
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17",
    department: "Business Administration"
  },
  {
    id: "4",
    title: "Robotics Competition",
    description: "Showcase your robotics skills and compete for exciting prizes.",
    date: "2025-06-15T10:00:00",
    location: "Engineering Workshop Area",
    totalSlots: 20,
    availableSlots: 12,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    department: "Mechanical Engineering"
  }
];

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: `${events.length + 1}`,
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
    setEvents(
      events.map((event) => {
        if (event.id === id) {
          return { ...event, ...updatedEvent };
        }
        return event;
      })
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    // Also remove all registrations for this event
    setRegistrations(registrations.filter((reg) => reg.eventId !== id));
  };

  const registerForEvent = (
    eventId: string,
    userId: string,
    teamName: string,
    teamMembers: TeamMember[]
  ) => {
    // Find the event
    const event = events.find((e) => e.id === eventId);
    if (!event || event.availableSlots <= 0) {
      throw new Error("Event not found or no slots available");
    }

    // Check if user is already registered
    if (isUserRegisteredForEvent(userId, eventId)) {
      throw new Error("You are already registered for this event");
    }

    // Create new registration
    const newRegistration: EventRegistration = {
      id: `reg_${registrations.length + 1}`,
      eventId,
      userId,
      teamName,
      teamMembers,
      registrationDate: new Date().toISOString(),
    };

    setRegistrations([...registrations, newRegistration]);

    // Update available slots
    updateEvent(eventId, { availableSlots: event.availableSlots - 1 });
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

  const increaseEventSlots = (id: string, additionalSlots: number) => {
    const event = events.find((e) => e.id === id);
    if (!event) {
      throw new Error("Event not found");
    }

    updateEvent(id, {
      totalSlots: event.totalSlots + additionalSlots,
      availableSlots: event.availableSlots + additionalSlots,
    });
  };

  const isUserRegisteredForEvent = (userId: string, eventId: string) => {
    return registrations.some((reg) => reg.userId === userId && reg.eventId === eventId);
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
