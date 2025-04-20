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

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user?.id)
        .single();

      if (profile?.role !== role) {
        throw new Error("Invalid role for this user");
      }

      setUser({
        id: user.id,
        email: user.email!,
        name: profile.name || '',
        role: role
      });
      
      localStorage.setItem("eventify_user", JSON.stringify({
        id: user.id,
        email: user.email,
        name: profile.name,
        role: role
      }));
    } catch (error) {
      console.error("Login failed:", error);
      if (error?.user?.id) {
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
      if (DUMMY_USERS.some((u) => u.email === email)) {
        throw new Error("User with this email already exists");
      }

      const newUser = {
        id: `${DUMMY_USERS.length + 1}`,
        name,
        email,
        password,
        role,
      };

      DUMMY_USERS.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem("eventify_user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword as User);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
