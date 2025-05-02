
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define interfaces
export interface User {
  id: string;
  name: string;
  role: 'student' | 'admin';
}

// Authentication service functions
export const getCurrentSession = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error: any) {
    console.error("Error getting session:", error.message);
    return null;
  }
}

export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Profile not found");

    return {
      id: userId,
      name: data.name,
      role: data.role as "student" | "admin"
    };
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }
}

export const registerUser = async (name: string, email: string, password: string, role: 'student' | 'admin') => {
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

    if (error) throw error;

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

      if (profileError) throw profileError;
    }

    toast({
      title: "Success",
      description: "Registration successful",
    });

    return data;
  } catch (error: any) {
    console.error("Registration error:", error.message);
    toast({
      title: "Error",
      description: error.message || "Registration failed",
      variant: "destructive",
    });
    throw error;
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting to log in:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    console.log("Login successful:", data);
    toast({
      title: "Success",
      description: "Login successful",
    });

    return data;
  } catch (error: any) {
    console.error("Login error:", error.message);
    toast({
      title: "Error",
      description: error.message || "Login failed",
      variant: "destructive",
    });
    throw error;
  }
}

export const logoutUser = async () => {
  try {
    console.log("Logging out user...");
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    console.log("Logout successful");
    toast({
      title: "Success",
      description: "Logout successful",
    });
    
    return true;
  } catch (error: any) {
    console.error("Logout error:", error.message);
    toast({
      title: "Error",
      description: error.message || "Logout failed",
      variant: "destructive",
    });
    throw error;
  }
}
