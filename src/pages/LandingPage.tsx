import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eventify-light">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-eventify-purple to-eventify-blue py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Simplified Event Management for Students
                </h1>
                <p className="text-xl opacity-90 mb-8">
                  Register for events, manage your participation, and get automated certificates and on-duty letters.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate('/events')}
                    size="lg"
                    variant="secondary"
                    className="bg-white text-eventify-purple hover:bg-gray-100"
                  >
                    Explore Events
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 hover:text-white/90 hover:border-white/50"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94" 
                  alt="Students at event" 
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Simplify Your Event Experience</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-14 h-14 bg-eventify-purple/10 text-eventify-purple rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Event Registration</h3>
                <p className="text-gray-600">
                  Browse and register for events with just a few clicks. Track your registrations in one place.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-14 h-14 bg-eventify-blue/10 text-eventify-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Management</h3>
                <p className="text-gray-600">
                  Create teams for events, add members from your department, and manage your participation.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-14 h-14 bg-eventify-teal/10 text-eventify-teal rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Automated Documents</h3>
                <p className="text-gray-600">
                  Get certificates and on-duty letters automatically generated for your event participation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Eventify today and simplify your event management experience.
            </p>
            <Button onClick={() => navigate('/register')} size="lg" className="bg-eventify-purple hover:bg-eventify-purple/90">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-4">Eventify</h2>
              <p className="max-w-xs">
                Simplifying event management for students and administrators.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-medium mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Certificates</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
