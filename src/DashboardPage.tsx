
import React, { useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
    
    // Create storage bucket if it doesn't exist
    const createCertificatesBucket = async () => {
      try {
        // Check if bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (!error && buckets) {
          const certificatesBucket = buckets.find(b => b.name === 'certificates');
          
          if (!certificatesBucket) {
            console.log('Creating certificates bucket...');
            const { data, error } = await supabase.storage.createBucket('certificates', {
              public: true, // Make bucket public so certificates are accessible
            });
            
            if (error) {
              console.error('Error creating certificates bucket:', error);
            } else {
              console.log('Certificates bucket created successfully');
            }
          }
        }
      } catch (err) {
        console.error('Error checking/creating certificates bucket:', err);
      }
    };
    
    // Only try to create bucket if user is authenticated
    if (isAuthenticated && user) {
      createCertificatesBucket();
    }
  }, [loading, isAuthenticated, navigate, user]);

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-eventify-light py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-eventify-purple" />
            </div>
            <p className="text-gray-600 mt-2">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eventify-light py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Welcome to your dashboard, {user.name}
            </h1>
            <p className="text-gray-600">
              {user.role === 'admin'
                ? 'Manage your events and view registrations'
                : 'View your event registrations and certificates'}
            </p>
          </div>

          {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
