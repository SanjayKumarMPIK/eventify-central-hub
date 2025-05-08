import React, { useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { supabase } from '@/integrations/supabase/client';

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
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="w-48 h-8 bg-gray-200 rounded mb-4"></div>
              <div className="w-64 h-4 bg-gray-200 rounded mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6">
                    <div className="w-12 h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
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
