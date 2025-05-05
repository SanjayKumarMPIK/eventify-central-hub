
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event.types';

export async function fetchEvents(): Promise<Event[]> {
  try {
    console.log("Fetching events from Supabase");
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      throw error;
    }

    console.log("Events data received:", data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log("No events found in database");
      return [];
    }
    
    // Map the data to our Event type
    const eventsData: Event[] = data.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      department: event.department || 'General',
      image: event.image || '/placeholder.svg',
      total_slots: event.total_slots,
      available_slots: event.available_slots,
    }));

    return eventsData;
  } catch (error: any) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

export async function addEvent(event: Omit<Event, "id">): Promise<Event | null> {
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
          available_slots: event.total_slots, // Initially all slots are available
          image: event.image,
          department: event.department,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding event:", error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Error adding event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

export async function increaseEventSlots(id: string, additionalSlots: number): Promise<Event | null> {
  try {
    // Get the current event
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching event:", fetchError);
      throw fetchError;
    }
    
    const newTotalSlots = event.total_slots + additionalSlots;

    const { data, error } = await supabase
      .from("events")
      .update({ 
        total_slots: newTotalSlots,
        available_slots: event.available_slots + additionalSlots 
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error increasing event slots:", error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Error increasing event slots:", error);
    throw error;
  }
}
