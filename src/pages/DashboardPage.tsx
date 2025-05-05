
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { fetchEvents, loading: eventsLoading } = useEvents();
  const navigate = useNavigate();

  // Load events when dashboard mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Dashboard mounted, fetching events for user:", user.id);
      fetchEvents().catch(error => {
        console.error("Error fetching events in dashboard:", error);
        toast({
          title: "Error loading events",
          description: "There was a problem loading your events. Please try again.",
          variant: "destructive",
        });
      });
    }
  }, [isAuthenticated, user, fetchEvents]);

  // Show loading state
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-eventify-light py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-eventify-purple mb-4" />
              <p className="text-lg">Verifying authentication...</p>
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
