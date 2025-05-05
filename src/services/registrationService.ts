
import { supabase } from '@/integrations/supabase/client';
import { EventRegistration, TeamMember } from '@/types/event.types';
import { toast } from '@/hooks/use-toast';

export async function registerForEvent(
  eventId: string,
  userId: string,
  teamName: string,
  teamMembers: TeamMember[]
): Promise<boolean> {
  try {
    // Check if event has available slots
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("available_slots")
      .eq("id", eventId)
      .single();
      
    if (eventError) {
      console.error("Error checking event availability:", eventError);
      throw new Error("Could not check event availability");
    }
    
    if (eventData.available_slots <= 0) {
      throw new Error("This event is full. No more slots available.");
    }
    
    // Check if user is already registered for this event
    const { data: existingReg, error: checkError } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId);
      
    if (checkError) {
      console.error("Error checking existing registration:", checkError);
      throw new Error("Could not check registration status");
    }
    
    if (existingReg && existingReg.length > 0) {
      throw new Error("You are already registered for this event");
    }

    // Insert registration
    const { data: registrationData, error: registrationError } =
      await supabase
        .from("event_registrations")
        .insert([{ event_id: eventId, user_id: userId, team_name: teamName }])
        .select()
        .single();

    if (registrationError) {
      console.error("Error creating registration:", registrationError);
      throw registrationError;
    }

    // Insert team members with registration ID
    const teamMembersToInsert = teamMembers.map((member) => ({
      registration_id: registrationData.id,
      name: member.name,
      department: member.department,
      email: member.email || null,
    }));

    const { error: teamMembersError } = await supabase
      .from("team_members")
      .insert(teamMembersToInsert);

    if (teamMembersError) {
      console.error("Error adding team members:", teamMembersError);
      throw teamMembersError;
    }

    // Event slots are updated automatically via database trigger
    toast({
      title: "Success",
      description: "Registration successful",
    });

    return true;
  } catch (error: any) {
    console.error("Error registering for event:", error);
    toast({
      title: "Registration Failed",
      description: error.message || "Could not complete registration",
      variant: "destructive"
    });
    throw error;
  }
}

export async function isUserRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId);

    if (error) {
      console.error("Error checking registration:", error);
      throw error;
    }

    return data && data.length > 0;
  } catch (error: any) {
    console.error("Error checking registration status:", error);
    return false;
  }
}

export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
  try {
    // Fetch registrations
    const { data: registrations, error: regError } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("user_id", userId);

    if (regError) {
      console.error("Error fetching registrations:", regError);
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations found for user:", userId);
      return [];
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

        const formattedTeamMembers: TeamMember[] = teamMembers.map(member => ({
          name: member.name,
          department: member.department,
          email: member.email || undefined,
        }));

        return {
          id: reg.id,
          eventId: reg.event_id,
          userId: reg.user_id,
          teamName: reg.team_name,
          registrationDate: reg.registration_date,
          teamMembers: formattedTeamMembers,
        };
      })
    );

    const validRegistrations = registrationsWithTeamMembers.filter(Boolean) as EventRegistration[];
    console.log(`Found ${validRegistrations.length} registrations for user:`, userId);
    
    return validRegistrations;
  } catch (error: any) {
    console.error("Error fetching user registrations:", error);
    return [];
  }
}

export async function getRegistrationsByEventId(eventId: string) {
  try {
    // Fetch registrations for the event
    const { data: registrations, error: regError } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId);

    if (regError) {
      console.error("Error fetching event registrations:", regError);
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations found for event:", eventId);
      return [];
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

        // Safe defaults if user profile doesn't exist or has an error
        let userName = "Unknown User";
        let userEmail = "No email";
        
        // Only try to access userData if it exists and there's no error
        if (!userError && userData) {
          userName = userData.name || "Unknown User";
          userEmail = userData.email || "No email";
        }

        return {
          id: reg.id,
          eventId: reg.event_id,
          userId: reg.user_id,
          userName: userName,
          userEmail: userEmail,
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
}
