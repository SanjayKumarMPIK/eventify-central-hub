import React, { useState } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Plus, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import EventRegistrations from './EventRegistrations';

const AdminDashboard = () => {
  const { events, addEvent, deleteEvent, increaseEventSlots } = useEvents();
  const { toast } = useToast();
  
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    total_slots: 20,
    department: '',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
  });

  // Add slots form state
  const [addSlotsData, setAddSlotsData] = useState({
    eventId: '',
    additionalSlots: 5,
  });
  const [isAddSlotsOpen, setIsAddSlotsOpen] = useState(false);
  
  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    setIsLoading(true);
    
    try {
      // Validate form
      if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.department) {
        throw new Error("Please fill in all required fields");
      }
      
      // Combine date and time
      const dateTimeString = `${newEvent.date}T${newEvent.time}:00`;
      const dateTime = new Date(dateTimeString);
      
      // Validate date and time
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }
      
      // Create event
      addEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: dateTimeString,
        location: newEvent.location,
        total_slots: Number(newEvent.total_slots),
        available_slots: Number(newEvent.total_slots),
        department: newEvent.department,
        image: newEvent.image,
      });
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        total_slots: 20,
        department: '',
        image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
      });
      
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      setIsAddEventOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlots = () => {
    try {
      increaseEventSlots(addSlotsData.eventId, Number(addSlotsData.additionalSlots));
      toast({
        title: "Success",
        description: `Added ${addSlotsData.additionalSlots} slots to the event`,
      });
      setIsAddSlotsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        deleteEvent(id);
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <Tabs defaultValue="events" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new event.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleNewEventChange}
                    placeholder="Web Development Workshop"
                  />
                </div>
                
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleNewEventChange}
                    placeholder="Provide a detailed description of the event..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleNewEventChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={newEvent.time}
                    onChange={handleNewEventChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={handleNewEventChange}
                    placeholder="Main Hall, Building A"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_slots">Total Slots</Label>
                  <Input
                    id="total_slots"
                    name="total_slots"
                    type="number"
                    min="1"
                    value={newEvent.total_slots}
                    onChange={handleNewEventChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={newEvent.department}
                    onChange={handleNewEventChange}
                    placeholder="Computer Science"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={newEvent.image}
                    onChange={handleNewEventChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddEvent}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddSlotsOpen} onOpenChange={setIsAddSlotsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add More Slots</DialogTitle>
                <DialogDescription>
                  Increase the capacity for this event.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="additionalSlots">Additional Slots</Label>
                  <Input
                    id="additionalSlots"
                    type="number"
                    min="1"
                    value={addSlotsData.additionalSlots}
                    onChange={(e) => setAddSlotsData(prev => ({ ...prev, additionalSlots: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddSlotsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSlots}>
                  Add Slots
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-gray-600">No events yet</h3>
                <p className="text-gray-500 mt-2 mb-4">Create your first event to get started.</p>
                <Button onClick={() => setIsAddEventOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Event
                </Button>
              </div>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{format(new Date(event.date), 'MMM dd, yyyy - h:mm a')}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{event.available_slots} / {event.total_slots} slots available</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddSlotsData({
                          eventId: event.id,
                          additionalSlots: 5,
                        });
                        setIsAddSlotsOpen(true);
                      }}
                    >
                      Add Slots
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedEvent(event.id)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="registrations">
          <EventRegistrations selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
        </TabsContent>
        
        <TabsContent value="certificates">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium mb-4">Certificate Management</h3>
            <p className="text-gray-600 mb-6">
              Generate and manage certificates for event participants.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Templates</CardTitle>
                  <CardDescription>Manage your certificate designs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create and customize templates for different events</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Manage Templates
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Generation</CardTitle>
                  <CardDescription>Generate certificates in bulk</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create certificates for all participants at once</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Generate Certificates
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>On-Duty Letters</CardTitle>
                  <CardDescription>Generate on-duty letters</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create official on-duty letters for participants</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Create Letters
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
