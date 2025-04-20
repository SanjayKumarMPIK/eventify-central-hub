
import React from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface CertificatePreviewProps {
  eventId: string;
  type: 'certificate' | 'duty';
}

const CertificatePreview = ({ eventId, type }: CertificatePreviewProps) => {
  const { getEventById, getUserRegistrations } = useEvents();
  const { user } = useAuth();
  
  const event = getEventById(eventId);
  
  if (!event || !user) {
    return (
      <div className="text-center p-8">
        <p>Event or user information not found.</p>
      </div>
    );
  }
  
  const registrations = getUserRegistrations(user.id);
  const registration = registrations.find(reg => reg.eventId === eventId);
  
  if (!registration) {
    return (
      <div className="text-center p-8">
        <p>Registration information not found.</p>
      </div>
    );
  }

  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  const eventDate = format(new Date(event.date), 'MMMM dd, yyyy');
  
  if (type === 'certificate') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full p-8 border border-gray-300 rounded-lg bg-white">
          <div className="border-8 border-eventify-purple/20 p-6 min-h-[400px] relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-eventify-purple/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-eventify-blue/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-eventify-purple to-eventify-blue bg-clip-text text-transparent mb-2">
                Eventify
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">Certificate of Participation</h2>
              <p className="text-gray-500 mb-8">This certifies that</p>
              
              <h3 className="text-2xl font-bold text-eventify-purple mb-1">
                {user.name}
              </h3>
              <p className="text-gray-500 mb-8">has successfully participated in</p>
              
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                {event.title}
              </h4>
              <p className="text-gray-600">
                held on {eventDate} at {event.location}
              </p>
              
              <div className="mt-12 flex justify-between items-center">
                <div className="text-left">
                  <div className="h-0.5 w-32 bg-gray-400 mb-2"></div>
                  <p className="text-gray-600">Date: {currentDate}</p>
                </div>
                
                <div className="text-right">
                  <div className="h-0.5 w-32 bg-gray-400 mb-2"></div>
                  <p className="text-gray-600">Event Coordinator</p>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 text-xs text-gray-400">
                Certificate ID: CERT-{event.id}-{user.id}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end w-full mt-4">
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download Certificate
          </Button>
        </div>
      </div>
    );
  } else {
    // On-Duty Letter
    return (
      <div className="flex flex-col items-center">
        <div className="w-full p-8 border border-gray-300 rounded-lg bg-white">
          <div className="border border-gray-200 p-6 min-h-[500px]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-eventify-purple to-eventify-blue bg-clip-text text-transparent">
                Eventify
              </h2>
              <p className="text-gray-500">Event Management System</p>
            </div>
            
            <div className="text-right mb-6">
              <p>Date: {currentDate}</p>
              <p>Ref: OD-{event.id}-{user.id}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-center underline">ON DUTY CERTIFICATE</h2>
            </div>
            
            <div className="space-y-4 text-justify">
              <p>This is to certify that <strong>{user.name}</strong> participated in <strong>"{event.title}"</strong> organized by Eventify on <strong>{eventDate}</strong> at <strong>{event.location}</strong>.</p>
              
              <p>The student was on duty during the event hours and should be considered present for their academic commitments during this period.</p>
              
              <p className="mb-8">The department is requested to consider this as an authorized absence for academic purposes.</p>
              
              <p>Yours sincerely,</p>
              
              <div className="mt-8">
                <div className="h-0.5 w-32 bg-gray-400 mb-2"></div>
                <p>Event Coordinator</p>
                <p>Eventify</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end w-full mt-4">
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download Letter
          </Button>
        </div>
      </div>
    );
  }
};

export default CertificatePreview;
