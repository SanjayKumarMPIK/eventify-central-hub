
import React, { useState, useEffect } from 'react';
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
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const event = getEventById(eventId);
  
  // Fetch registration data when component mounts
  useEffect(() => {
    const fetchRegistration = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const registrations = await getUserRegistrations(user.id);
        const foundRegistration = registrations.find(reg => reg.eventId === eventId);
        setRegistration(foundRegistration);
      } catch (error) {
        console.error("Error fetching registration:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistration();
  }, [eventId, user, getUserRegistrations]);
  
  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading certificate information...</p>
      </div>
    );
  }
  
  if (!event || !user) {
    return (
      <div className="text-center p-8">
        <p>Certificate information not available</p>
      </div>
    );
  }
  
  if (!registration) {
    return (
      <div className="text-center p-8">
        <p>You are not registered for this event</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-sm relative">
      {type === 'certificate' ? (
        <div className="certificate text-center py-8">
          <div className="border-8 border-double border-gray-300 p-6">
            <h2 className="text-3xl font-serif mb-6">Certificate of Participation</h2>
            
            <p className="text-lg mb-8">This is to certify that</p>
            <p className="text-2xl font-bold mb-3">{user.name}</p>
            <p className="text-lg mb-6">has successfully participated in</p>
            <p className="text-xl font-bold mb-3">{event.title}</p>
            <p className="text-md mb-8">held on {format(new Date(event.date), 'MMMM dd, yyyy')}</p>
            
            <div className="mt-12 flex justify-between items-center">
              <div>
                <div className="w-20 h-px bg-black mx-auto mb-1"></div>
                <p>Date</p>
              </div>
              <div>
                <div className="w-32 h-px bg-black mx-auto mb-1"></div>
                <p>Event Coordinator</p>
              </div>
            </div>
          </div>
          
          <Button className="mt-6">
            <Download className="h-4 w-4 mr-2" /> Download Certificate
          </Button>
        </div>
      ) : (
        <div className="duty-letter p-8">
          <div className="text-right mb-6">
            <p>Date: {format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          
          <h2 className="text-xl font-bold mb-6">ON-DUTY CERTIFICATE</h2>
          
          <p className="mb-4">TO WHOMSOEVER IT MAY CONCERN</p>
          
          <p className="mb-4">
            This is to certify that <span className="font-semibold">{user.name}</span> participated 
            in "<span className="font-semibold">{event.title}</span>" organized by our institution 
            on {format(new Date(event.date), 'MMMM dd, yyyy')}.
          </p>
          
          <p className="mb-8">
            Kindly treat their absence as on-duty for the mentioned date.
          </p>
          
          <div className="mt-12">
            <div className="w-32 h-px bg-black mb-1"></div>
            <p>Event Coordinator</p>
          </div>
          
          <Button className="mt-6">
            <Download className="h-4 w-4 mr-2" /> Download Letter
          </Button>
        </div>
      )}
      
      <div className="absolute top-4 right-4 opacity-30 text-xs">
        ID: {registration.registrationId}
      </div>
    </div>
  );
};

export default CertificatePreview;
