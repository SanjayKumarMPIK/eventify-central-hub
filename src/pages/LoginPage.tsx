
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
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
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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
    
    setIsLoading(true);
    
    try {
      await login(email, password, role);
      // The AuthContext will handle redirects and success messages
    } catch (error) {
      // AuthContext already shows toast messages for errors
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
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-gray-500">Login to manage your events</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
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
                  Login as a student to register for events and access your certificates.
                </p>
              </TabsContent>
              
              <TabsContent value="admin">
                <p className="text-sm text-muted-foreground mt-2">
                  Login as an admin to manage events and review registrations.
                </p>
              </TabsContent>
            </Tabs>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-eventify-purple hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-eventify-purple hover:underline">
                Register
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

export default LoginPage;
