
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  login: (email: string, password: string, role: "student" | "admin") => Promise<void>;
  register: (name: string, email: string, password: string, role: "student" | "admin", adminCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Admin code for registering as an admin
const ADMIN_REGISTRATION_CODE = "AdminRitChennai";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
          // Fetch user profile from profiles table
          fetchUserProfile(currentSession.user.id);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    const initializeUser = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
          // Fetch user profile from profiles table
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Cleanup the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as "student" | "admin",
        });
      } else {
        // If profile doesn't exist in the profiles table
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  const validateRITEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.ritchennai\.edu\.in$/;
    return emailRegex.test(email);
  };

  const login = async (email: string, password: string, role: "student" | "admin") => {
    setLoading(true);
    try {
      // Check if email is in required format
      if (!validateRITEmail(email)) {
        throw new Error("Email must be from ritchennai.edu.in domain");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // After successful login, the onAuthStateChange listener will update the user state
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Login Failed",
          description: "Please check your email to confirm your account before logging in",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials or account not found",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: "student" | "admin", 
    adminCode?: string
  ) => {
    setLoading(true);
    try {
      // Check if email is in required format
      if (!validateRITEmail(email)) {
        throw new Error("Email must be from ritchennai.edu.in domain");
      }

      // Check if trying to register as admin
      if (role === "admin") {
        // Verify admin code
        if (!adminCode || adminCode !== ADMIN_REGISTRATION_CODE) {
          throw new Error("Invalid admin registration code");
        }
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        }
      });

      if (error) {
        throw error;
      }

      // Display success message
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Check your email to confirm your account.",
      });

      // Note: The user will not be immediately set here. 
      // The trigger function we created in Supabase will add the user to the profiles table,
      // and the auth state change listener will update the user state.
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // User state will be cleared by the auth state change listener
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user && !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
