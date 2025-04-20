
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
    const savedUser = localStorage.getItem("eventify_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, department')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Create a profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            name: email.split('@')[0],  // Default name
            department: role === 'admin' ? 'Administration' : 'Student'
          });
      }

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
      // Register the user with Supabase
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Create a profile for the new user
      await supabase.from('profiles').insert({
        id: user?.id,
        name: name,
        department: role === 'admin' ? 'Administration' : 'Student'
      });
      
      const userData: User = {
        id: user?.id || '',
        email: email,
        name: name,
        role: role
      };
      
      localStorage.setItem("eventify_user", JSON.stringify(userData));
      setUser(userData);
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
