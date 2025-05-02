
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast"

// Define the types for user and auth context
interface User {
  id: string;
  name: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setIsAuthenticated(true);
        await getUserProfile(data.session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        await getUserProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to get user profile
  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      // Update user state with profile data
      setUser({
        id: userId,
        name: data.name,
        role: data.role as "student" | "admin" // Add type assertion to fix the error
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If profile not found, log out the user
      await logout();
      setUser(null);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create user profile in 'profiles' table
      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name: name,
              role: role,
              email: email,
            },
          ]);

        if (profileError) {
          throw profileError;
        }
      }

      setIsAuthenticated(true);
      setUser({ id: data.user!.id, name: name, role: role });
      toast({
        title: "Success",
        description: "Registration successful",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Registration error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsAuthenticated(true);
      await getUserProfile(data.user!.id);
      toast({
        title: "Success",
        description: "Login successful",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setIsAuthenticated(false);
      setUser(null);
      toast({
        title: "Success",
        description: "Logout successful",
      });
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Provide the auth context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
