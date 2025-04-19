
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById, registerForEvent, isUserRegisteredForEvent } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    { name: user?.name || '', department: '', email: user?.email || '' },
    { name: '', department: '', email: '' },
  ]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const event = getEventById(id || '');

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-eventify-light py-8">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/events')}>View All Events</Button>
          </div>
        </div>
      </>
    );
  }

  const isRegistered = user ? isUserRegisteredForEvent(user.id, event.id) : false;
  const canRegister = event.availableSlots > 0 && !isRegistered;
  
  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const addTeamMember = () => {
    if (teamMembers.length < 5) {
      setTeamMembers([...teamMembers, { name: '', department: '', email: '' }]);
    } else {
      toast({
        title: "Team limit reached",
        description: "You can add a maximum of 5 team members",
        variant: "destructive",
      });
    }
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      const updatedMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updatedMembers);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!teamName.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    // Validate team members
    const invalidMembers = teamMembers.filter(m => !m.name.trim() || !m.department.trim());
    if (invalidMembers.length > 0) {
      toast({
        title: "Invalid team members",
        description: "All team members must have a name and department",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      await registerForEvent(event.id, user.id, teamName, teamMembers);
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event!",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const eventDate = new Date(event.date);
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eventify-light">
        {/* Hero image */}
        <div className="h-64 md:h-80 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md -mt-16 relative z-20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-eventify-purple/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-eventify-purple" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{format(eventDate, 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-eventify-blue/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-eventify-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{format(eventDate, 'h:mm a')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-eventify-teal/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-eventify-teal" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Slots</p>
                      <p className="font-medium">
                        {event.availableSlots} of {event.totalSlots}
                        {event.availableSlots === 0 && (
                          <span className="text-red-500 ml-2 text-sm font-normal">(Full)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">About this event</h2>
                  <p className="text-gray-700 mb-6 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-72 lg:w-96">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Registration</h3>
                  
                  {isRegistered ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-green-700 font-medium mb-2">You're registered!</p>
                      <p className="text-gray-600 text-sm mb-4">
                        You have successfully registered for this event.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')}
                      >
                        View in Dashboard
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-6">
                        {canRegister 
                          ? "Register now to secure your spot in this event!" 
                          : "This event is currently full. Check back later for availability."}
                      </p>
                      
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            disabled={!canRegister}
                            onClick={() => {
                              if (!isAuthenticated) {
                                toast({
                                  title: "Login Required",
                                  description: "Please log in to register for this event.",
                                });
                                navigate('/login');
                              }
                            }}
                          >
                            {isAuthenticated 
                              ? (canRegister ? "Register Now" : "Event Full") 
                              : "Login to Register"}
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Register for {event.title}</DialogTitle>
                            <DialogDescription>
                              Fill in your team details to complete registration.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="team-name">Team Name</Label>
                              <Input
                                id="team-name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter your team name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Team Members</Label>
                              
                              {teamMembers.map((member, index) => (
                                <div key={index} className="space-y-2 p-3 border rounded-md">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">Member {index + 1}</p>
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTeamMember(index)}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Input
                                      value={member.name}
                                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                      placeholder="Name"
                                    />
                                    
                                    <Input
                                      value={member.department}
                                      onChange={(e) => handleMemberChange(index, 'department', e.target.value)}
                                      placeholder="Department"
                                    />
                                    
                                    <Input
                                      value={member.email || ''}
                                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                                      placeholder="Email (optional)"
                                    />
                                  </div>
                                </div>
                              ))}
                              
                              {teamMembers.length < 5 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={addTeamMember}
                                >
                                  Add Team Member
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="button" 
                              onClick={handleRegister}
                              disabled={isRegistering}
                            >
                              {isRegistering ? "Registering..." : "Complete Registration"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventDetailPage;
