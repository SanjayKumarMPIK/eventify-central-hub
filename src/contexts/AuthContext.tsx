
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
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const session = await getCurrentSession();
        
        if (session) {
          setIsAuthenticated(true);
          await getUserProfile(session.user.id);
        } else {
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.id);
      setLoading(true);
      try {
        if (session) {
          setIsAuthenticated(true);
          await getUserProfile(session.user.id);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to get user profile
  const getUserProfile = async (userId: string) => {
    try {
      const userData = await getCurrentUser(userId);
      setUser(userData);
      if (!userData) {
        console.error("Profile not found, logging out");
        await logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If profile not found, log out the user
      await logout();
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
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Logout function - Fixed to ensure proper state cleanup
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      // Important: Clear user state AFTER successful logout
      setIsAuthenticated(false);
      setUser(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout error in context:", error);
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
