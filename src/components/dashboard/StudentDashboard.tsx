
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, MapPin, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import CertificatePreview from './CertificatePreview';

const StudentDashboard = () => {
  const { events, getUserRegistrations } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [previewEvent, setPreviewEvent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'certificate' | 'duty'>('certificate');
  
  // Get user registrations
  const userRegistrations = user ? getUserRegistrations(user.id) : [];
  
  // Get registered events details
  const registeredEvents = userRegistrations.map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    if (!event) return null;
    
    return {
      ...event,
      registrationId: reg.id,
      registrationDate: reg.registrationDate,
      teamName: reg.teamName,
      teamMembers: reg.teamMembers,
    };
  }).filter(Boolean);

  const handlePreviewCertificate = (eventId: string) => {
    setPreviewEvent(eventId);
    setPreviewType('certificate');
  };

  const handlePreviewDutyLetter = (eventId: string) => {
    setPreviewEvent(eventId);
    setPreviewType('duty');
  };

  const closePreview = () => {
    setPreviewEvent(null);
  };

  return (
    <div>
      <Tabs defaultValue="myEvents" className="w-full">
        <TabsList>
          <TabsTrigger value="myEvents">My Events</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="dutyLetters">On-Duty Letters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="myEvents">
          {registeredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-4">No events registered</h3>
              <p className="text-gray-600 mb-6">
                You haven't registered for any events yet. Browse and register for upcoming events!
              </p>
              <Button onClick={() => navigate('/events')}>
                Explore Events
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event: any) => (
                <Card key={event.registrationId} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      Team: {event.teamName}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{format(new Date(event.date), 'MMMM dd, yyyy - h:mm a')}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      Event Details
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-eventify-purple"
                        onClick={() => handlePreviewCertificate(event.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="certificates">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-medium">My Certificates</h3>
                <p className="text-gray-600">
                  View and download certificates for events you've participated in
                </p>
              </div>
            </div>
            
            {registeredEvents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <h4 className="font-medium text-gray-600">No certificates available</h4>
                <p className="text-gray-500 mt-2 mb-4">
                  Register and participate in events to earn certificates
                </p>
                <Button onClick={() => navigate('/events')}>
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registeredEvents.map((event: any) => (
                  <Card key={`cert-${event.registrationId}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        Participated on {format(new Date(event.date), 'MMMM dd, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Certificate for successful participation in this event
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewCertificate(event.id)}
                      >
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="dutyLetters">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-medium">On-Duty Letters</h3>
                <p className="text-gray-600">
                  View and download on-duty letters for events you've participated in
                </p>
              </div>
            </div>
            
            {registeredEvents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <h4 className="font-medium text-gray-600">No on-duty letters available</h4>
                <p className="text-gray-500 mt-2 mb-4">
                  Register and participate in events to get on-duty letters
                </p>
                <Button onClick={() => navigate('/events')}>
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registeredEvents.map((event: any) => (
                  <Card key={`duty-${event.registrationId}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        Event date: {format(new Date(event.date), 'MMMM dd, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        On-duty letter confirming your participation in this event
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewDutyLetter(event.id)}
                      >
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={!!previewEvent} onOpenChange={closePreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewType === 'certificate' ? 'Certificate Preview' : 'On-Duty Letter Preview'}
            </DialogTitle>
            <DialogDescription>
              This is a preview of your {previewType === 'certificate' ? 'certificate' : 'on-duty letter'}.
              You can download the full version.
            </DialogDescription>
          </DialogHeader>
          
          {previewEvent && (
            <CertificatePreview
              eventId={previewEvent}
              type={previewType}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
