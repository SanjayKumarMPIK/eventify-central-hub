
import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const DashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { fetchEvents, loading: eventsLoading } = useEvents();

  // Load events when dashboard mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Dashboard mounted, fetching events");
      fetchEvents();
    }
  }, [isAuthenticated, fetchEvents]);

  // Show loading state
  if (authLoading || eventsLoading) {
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
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Dashboard rendering for user:", user);

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
