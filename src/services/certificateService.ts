import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Types for certificate data
export interface CertificateData {
  eventId: string;
  userId: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  type: 'certificate' | 'duty';
}

/**
 * Generate a certificate or duty letter PDF
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: data.type === 'certificate' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  if (data.type === 'certificate') {
    // Certificate styling
    doc.setFillColor(240, 240, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Add border
    doc.setDrawColor(100, 80, 220);
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 40, 180);
    doc.setFontSize(30);
    doc.text('Eventify', 148.5, 40, { align: 'center' });
    
    doc.setFontSize(24);
    doc.text('Certificate of Participation', 148.5, 55, { align: 'center' });
    
    // Content
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('This certifies that', 148.5, 75, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 40, 180);
    doc.setFontSize(18);
    doc.text(data.userName, 148.5, 85, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('has successfully participated in', 148.5, 95, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(data.eventTitle, 148.5, 105, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`held on ${data.eventDate} at ${data.eventLocation}`, 148.5, 115, { align: 'center' });
    
    // Signatures
    doc.setLineWidth(0.5);
    doc.setDrawColor(100, 100, 100);
    doc.line(60, 150, 110, 150);
    doc.line(187, 150, 237, 150);
    
    doc.setFontSize(10);
    doc.text('Date', 85, 160);
    doc.text('Event Coordinator', 212, 160);
    
    // Certificate ID
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: CERT-${data.eventId.substring(0, 8)}-${data.userId.substring(0, 8)}`, 270, 200, { align: 'right' });
  } else {
    // Duty Letter styling
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 40, 180);
    doc.setFontSize(20);
    doc.text('Eventify', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Event Management System', 105, 38, { align: 'center' });
    
    // Reference
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 170, 50, { align: 'right' });
    doc.text(`Ref: OD-${data.eventId.substring(0, 8)}-${data.userId.substring(0, 8)}`, 170, 56, { align: 'right' });
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ON DUTY CERTIFICATE', 105, 80, { align: 'center', angle: 0 });
    doc.line(70, 82, 140, 82);
    
    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text([
      `This is to certify that ${data.userName} participated in "${data.eventTitle}" organized by`,
      `Eventify on ${data.eventDate} at ${data.eventLocation}.`,
      '',
      'The student was on duty during the event hours and should be considered present for',
      'their academic commitments during this period.',
      '',
      'The department is requested to consider this as an authorized absence for academic purposes.',
    ], 25, 95);
    
    // Signature
    doc.text('Yours sincerely,', 25, 155);
    
    doc.line(25, 180, 80, 180);
    doc.text('Event Coordinator', 25, 185);
    doc.text('Eventify', 25, 192);
  }
  
  return doc.output('blob');
};

/**
 * Save certificate to Supabase storage and record in database
 */
export const saveCertificate = async (
  data: CertificateData,
  pdfBlob: Blob
): Promise<string | null> => {
  try {
    const fileName = `${data.type}_${data.eventId}_${data.userId}.pdf`;
    const filePath = `${data.userId}/${fileName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading certificate:', uploadError);
      throw uploadError;
    }
    
    // Create record in certificates table
    const { data: certRecord, error: certError } = await supabase
      .from('certificates')
      .upsert({
        user_id: data.userId,
        event_id: data.eventId,
        type: data.type,
        file_path: filePath
      })
      .select()
      .single();
      
    if (certError) {
      console.error('Error creating certificate record:', certError);
      throw certError;
    }
    
    // Get public URL for the file
    const publicURL = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);
      
    return publicURL.data.publicUrl;
  } catch (error) {
    console.error('Error saving certificate:', error);
    return null;
  }
};

/**
 * Check if certificate exists for user and event
 */
export const getCertificate = async (
  userId: string,
  eventId: string,
  type: 'certificate' | 'duty'
): Promise<{id: string, file_path: string} | null> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('id, file_path')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('type', type)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error checking certificate:', error);
    return null;
  }
};

/**
 * Get download URL for certificate
 */
export const getCertificateDownloadUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('certificates')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
