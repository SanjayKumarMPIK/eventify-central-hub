
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
