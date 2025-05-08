
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { 
  CertificateData, 
  generateCertificatePDF, 
  saveCertificate, 
  getCertificate,
  getCertificateDownloadUrl 
} from '@/services/certificateService';
import { format } from 'date-fns';

export const useCertificates = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getEventById } = useEvents();

  const generateAndDownload = async (eventId: string, type: 'certificate' | 'duty') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate certificates",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Check if certificate already exists
      console.log('Checking for existing certificate...');
      const existingCert = await getCertificate(user.id, eventId, type);
      
      if (existingCert) {
        // If exists, return download URL
        const downloadUrl = getCertificateDownloadUrl(existingCert.file_path);
        console.log('Found existing certificate with URL:', downloadUrl);
        return downloadUrl;
      }
      
      // Get event details
      const event = getEventById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      
      // Prepare certificate data
      const eventDate = format(new Date(event.date), 'MMMM dd, yyyy');
      const certData: CertificateData = {
        eventId,
        userId: user.id,
        userName: user.name,
        eventTitle: event.title,
        eventDate,
        eventLocation: event.location || "Event Location",
        type
      };
      
      console.log('Generating PDF for:', certData);
      
      // Generate PDF
      const pdfBlob = await generateCertificatePDF(certData);
      
      // Save to storage and get URL
      const downloadUrl = await saveCertificate(certData, pdfBlob);
      
      if (!downloadUrl) {
        throw new Error(`Failed to generate ${type === 'certificate' ? 'certificate' : 'duty letter'}`);
      }
      
      console.log('Generated new certificate with URL:', downloadUrl);
      
      toast({
        title: `${type === 'certificate' ? 'Certificate' : 'On-Duty Letter'} Generated`,
        description: "Your document has been generated and is ready to download",
      });
      
      return downloadUrl;
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadCertificate = (url: string, eventName: string, type: 'certificate' | 'duty') => {
    try {
      console.log('Downloading certificate from URL:', url);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName.replace(/\s+/g, '_')}_${type}.pdf`;
      link.target = '_blank'; // Open in a new tab to better handle direct downloads
      link.rel = 'noopener noreferrer';
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      
      // Small timeout to ensure the download starts before removing the element
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      toast({
        title: "Download Started",
        description: `Your ${type === 'certificate' ? 'certificate' : 'duty letter'} download has begun.`,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    generateAndDownload,
    downloadCertificate,
    isGenerating
  };
};
