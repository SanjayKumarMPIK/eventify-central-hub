
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EventsPage = () => {
  const navigate = useNavigate();
  const { events, loading, fetchEvents } = useEvents();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  // Refresh events data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorLoading(false);
    try {
      await fetchEvents();
      toast({
        title: "Refreshed",
        description: "Event list has been updated",
      });
    } catch (error) {
      console.error("Error refreshing events:", error);
      setErrorLoading(true);
      toast({
        title: "Refresh failed",
        description: "Could not update event list",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Effect to log when events are loaded or change
  useEffect(() => {
    if (!loading) {
      console.log("Events loaded:", events.length);
    }
  }, [events, loading]);

  // Unique departments for filter
  const departments = ['all', ...Array.from(new Set(events.filter(event => event.department).map(event => event.department)))];

  // Filtering events
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || event.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Loading Events</h1>
                <p className="text-gray-600 mt-1">Please wait while we fetch available events...</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 flex-1 flex flex-col">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full mb-4 flex-1" />
                    <div className="flex justify-between pt-2 border-t mt-auto">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Upcoming Events</h1>
              <p className="text-gray-600 mt-1">Browse and register for events</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 bg-white border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white border-gray-300">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isRefreshing} 
                className="w-full md:w-auto"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {errorLoading && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription>
                Error loading events. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          {events.length === 0 && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription>
                No events are currently available. Check back later for upcoming events.
              </AlertDescription>
            </Alert>
          )}

          {filteredEvents.length === 0 && events.length > 0 && (
            <div className="text-center py-16 bg-white shadow-sm rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No events found</h3>
              <p className="text-gray-500 mt-2 mb-4">Try adjusting your filters or search term.</p>
              <Button onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.image || '/placeholder.svg'}
                      alt={event.title || 'Event Image'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                        console.log(`Failed to load image for event: ${event.title}`);
                      }}
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-1">{event.title}</h3>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      <span>
                        {event.date ? format(new Date(event.date), 'MMMM dd, yyyy - h:mm a') : 'Date not set'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{event.location || 'No location provided'}</span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{event.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t mt-auto">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {event.available_slots ?? 0} / {event.total_slots ?? 0} slots available
                        </span>
                      </div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {event.department}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <Button
                      variant="default"
                      className="w-full bg-eventify-purple hover:bg-eventify-purple/90"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EventsPage;
