import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eventify-light">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-eventify-purple to-eventify-blue py-16">
          <div className="container mx-auto px-4 text-white text-center relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Eventify</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Simplifying event management for students and administrators
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4">
                  Eventify was created with a single goal in mind: to simplify the event management process for educational institutions. We understand the unique challenges that students and administrators face when organizing and participating in events.
                </p>
                <p className="text-gray-700">
                  Our platform streamlines everything from event creation and registration to certificate generation and on-duty letter distribution. By handling these administrative tasks efficiently, we allow organizers to focus on what truly matters - creating meaningful and impactful events.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="bg-eventify-purple/10 text-eventify-purple p-1 rounded mr-3 mt-0.5">✓</span>
                    <span>Simple event creation and management for administrators</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-eventify-purple/10 text-eventify-purple p-1 rounded mr-3 mt-0.5">✓</span>
                    <span>Easy registration process for students with team support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-eventify-purple/10 text-eventify-purple p-1 rounded mr-3 mt-0.5">✓</span>
                    <span>Automatic certificate generation for participants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-eventify-purple/10 text-eventify-purple p-1 rounded mr-3 mt-0.5">✓</span>
                    <span>On-duty letter generation for academic purposes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-eventify-purple/10 text-eventify-purple p-1 rounded mr-3 mt-0.5">✓</span>
                    <span>Comprehensive dashboards for tracking participation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-eventify-purple/10 text-eventify-purple rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-3">Create an Account</h3>
                <p className="text-gray-600">
                  Sign up as a student or administrator to access the appropriate features for your role.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-eventify-purple/10 text-eventify-purple rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-3">Manage Events</h3>
                <p className="text-gray-600">
                  Administrators create events, while students browse and register for events that interest them.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-eventify-purple/10 text-eventify-purple rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-3">Get Certificates</h3>
                <p className="text-gray-600">
                  After participation, students can download certificates and on-duty letters directly from their dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <p className="text-gray-600 mb-8 max-w-3xl">
              Eventify is developed by a passionate team of educators and developers who understand the challenges of event management in educational settings.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Sanjay Kumar MP</h3>
                <p className="text-gray-600 text-sm">Founder & CEO</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Sanjay Kumar MP</h3>
                <p className="text-gray-600 text-sm">Lead Developer</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Siddharthaa S & Yogeeshwar P</h3>
                <p className="text-gray-600 text-sm">UX Designer</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Sruthi K</h3>
                <p className="text-gray-600 text-sm">Education Specialist</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-6">
                  Have questions or suggestions about Eventify? We'd love to hear from you! Reach out to our team using the contact information below.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-eventify-purple" />
                    <span>EVENTIFY@gmail.com</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-eventify-purple" />
                    <span>1234567890</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-eventify-purple" />
                    <span></span>
                  </div>
                </div>
              </div>
              
              <div>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
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
                  <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
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

export default AboutPage;
