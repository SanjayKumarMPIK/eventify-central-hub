
import { Event } from '@/types/event.types';

// This file provides mock event data to test the UI
// You can use this if the real data source is not working

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'A gathering of tech professionals from around the world to discuss the latest trends and innovations.',
    date: '2025-06-15T09:00:00Z',
    location: 'Tech Center, Building A',
    total_slots: 100,
    available_slots: 75,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000',
    department: 'Technology'
  },
  {
    id: '2',
    title: 'Marketing Workshop',
    description: 'Learn the latest marketing strategies and techniques from industry experts.',
    date: '2025-07-20T13:00:00Z',
    location: 'Marketing Hub',
    total_slots: 50,
    available_slots: 20,
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1000',
    department: 'Marketing'
  },
  {
    id: '3',
    title: 'Leadership Summit',
    description: 'Develop your leadership skills with our intensive summit designed for emerging leaders.',
    date: '2025-08-10T10:00:00Z',
    location: 'Executive Center',
    total_slots: 75,
    available_slots: 40,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000',
    department: 'Management'
  }
];

// You can uncomment and modify the fetchEvents function below to use mock data
// if you're having issues with the actual API

/*
export async function fetchEventsMock(): Promise<Event[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEvents;
}
*/
