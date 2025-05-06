
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.ritchennai\.edu\.in$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Email must be in the format abc.123456@dept.ritchennai.edu.in",
        variant: "destructive",
      });
      return;
    }
    
    // Additional validation for admin registration
    if (role === 'admin' && !adminCode) {
      toast({
        title: "Error",
        description: "Admin code is required for admin registration",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password, role, adminCode);
      // Success toast is shown in AuthContext
      // Don't navigate - wait for email confirmation
    } catch (error) {
      // Error toast is shown in AuthContext
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-eventify-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-eventify-purple to-eventify-blue bg-clip-text text-transparent">
              Eventify
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="text-gray-500">Sign up to start using Eventify</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Enter your information to create your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="student" className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="student" 
                  onClick={() => setRole('student')}
                >
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  onClick={() => setRole('admin')}
                >
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student">
                <p className="text-sm text-muted-foreground mt-2">
                  Register as a student to participate in events.
                </p>
              </TabsContent>
              
              <TabsContent value="admin">
                <p className="text-sm text-muted-foreground mt-2">
                  Register as an admin to create and manage events. Admin registration requires an authorization code.
                </p>
              </TabsContent>
            </Tabs>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="abc.123456@dept.ritchennai.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Email format: abc.123456@dept.ritchennai.edu.in
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              {role === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Authorization Code</Label>
                  <Input
                    id="adminCode"
                    type="text"
                    placeholder="Enter admin code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required={role === 'admin'}
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-eventify-purple hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Make sure your email is in the format: abc.123456@dept.ritchennai.edu.in</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
