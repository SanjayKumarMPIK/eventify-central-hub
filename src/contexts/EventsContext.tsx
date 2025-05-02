
// Modify these specific functions within the EventsContext.tsx to fix TypeScript errors
// and ensure events are properly loaded from Supabase

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
