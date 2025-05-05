
import { supabase } from '@/integrations/supabase/client';
import { EventRegistration, TeamMember } from '@/types/event.types';

export async function registerForEvent(
  eventId: string,
  userId: string,
  teamName: string,
  teamMembers: TeamMember[]
): Promise<boolean> {
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

    return true;
  } catch (error: any) {
    console.error("Error registering for event:", error);
    return false;
  }
}

export async function isUserRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
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
}

export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
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
}

export async function getRegistrationsByEventId(eventId: string) {
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
          .select("name")
          .eq("id", reg.user_id)
          .single();

        // Safe defaults if user profile doesn't exist or has an error
        let userName = "Unknown User";
        
        // Only try to access userData if it exists and there's no error
        if (!userError && userData) {
          userName = userData.name || "Unknown User";
        }

        return {
          id: reg.id,
          eventId: reg.event_id,
          userId: reg.user_id,
          userName: userName,
          userEmail: "No email", // Removed email access since it doesn't exist in profiles table
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
