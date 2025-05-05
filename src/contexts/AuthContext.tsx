
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { User, getCurrentSession, getCurrentUser, registerUser, loginUser, logoutUser } from '@/services/authService';

// Define the auth context type
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Only perform synchronous updates here
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      // Use setTimeout to defer Supabase calls and prevent deadlocks
      if (session?.user) {
        setTimeout(async () => {
          await getUserProfile(session.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const session = await getCurrentSession();
        
        if (session) {
          console.log("Initial session found:", session.user.id);
          setIsAuthenticated(true);
          await getUserProfile(session.user.id);
        } else {
          console.log("No initial session found");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to get user profile
  const getUserProfile = async (userId: string) => {
    try {
      const userData = await getCurrentUser(userId);
      console.log("Got user profile:", userData);
      setUser(userData);
      if (!userData) {
        console.error("Profile not found, logging out");
        await logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If profile not found, log out the user
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const { user: authUser } = await registerUser(name, email, password, role);
      if (authUser) {
        setIsAuthenticated(true);
        setUser({ id: authUser.id, name, role });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Registration error in context:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginUser(email, password);
      // Auth state listener will handle session updates
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      console.log("AuthContext: Logging out user");
      await logoutUser();
      
      // Important: Clear user state AFTER successful logout
      setIsAuthenticated(false);
      setUser(null);
      
      // Force navigation to home page
      console.log("Navigating to home after logout");
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout error in context:", error);
      throw error;
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
