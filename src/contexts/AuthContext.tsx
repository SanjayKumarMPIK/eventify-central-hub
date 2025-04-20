
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: "student" | "admin") => Promise<void>;
  register: (name: string, email: string, password: string, role: "student" | "admin") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user on initial load
    const checkUser = async () => {
      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, department')
          .eq('id', session.user.id)
          .single();
          
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || '',
          role: profile?.department === 'Administration' ? 'admin' : 'student'
        };
        
        setUser(userData);
        localStorage.setItem("eventify_user", JSON.stringify(userData));
      }
      
      setLoading(false);
    };
    
    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, department')
            .eq('id', session.user.id)
            .single();
            
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || '',
            role: profile?.department === 'Administration' ? 'admin' : 'student'
          };
          
          setUser(userData);
          localStorage.setItem("eventify_user", JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem("eventify_user");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: "student" | "admin") => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await supabase.from('user_logins').insert({
        user_id: user?.id,
        ip_address: '',
        user_agent: navigator.userAgent,
        success: true
      });

      // Fetch the profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, department')
        .eq('id', user?.id)
        .single();

      // Set the user data
      const userData: User = {
        id: user?.id || '',
        email: user?.email || '',
        name: profile?.name || email.split('@')[0],
        role: role  // Use the role parameter passed to the login function
      };

      setUser(userData);
      
      localStorage.setItem("eventify_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login failed:", error);
      
      // Fix: Type guard to check if error is an object with a user property
      if (error && typeof error === 'object' && 'user' in error && error.user && typeof error.user === 'object' && 'id' in error.user) {
        await supabase.from('user_logins').insert({
          user_id: error.user.id,
          ip_address: '',
          user_agent: navigator.userAgent,
          success: false
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: "student" | "admin") => {
    setLoading(true);
    try {
      // Register the user with Supabase with auto confirmation (no email verification required)
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
          // This makes the user immediately confirmed without email verification
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      if (!user) throw new Error("No user returned from signUp");
      
      // Create a profile for the new user
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        name: name,
        department: role === 'admin' ? 'Administration' : 'Student'
      });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }
      
      const userData: User = {
        id: user.id || '',
        email: email,
        name: name,
        role: role
      };
      
      localStorage.setItem("eventify_user", JSON.stringify(userData));
      setUser(userData);

      // Also log them in automatically
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    localStorage.removeItem("eventify_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
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
