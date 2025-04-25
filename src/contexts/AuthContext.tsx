
import React, { createContext, useContext, useState, useEffect } from "react";

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
  register: (name: string, email: string, password: string, role: "student" | "admin", adminCode?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Admin code for registering as an admin
const ADMIN_REGISTRATION_CODE = "ADMIN123";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("eventify_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: "student" | "admin") => {
    setLoading(true);
    try {
      // Simulate API call
      const foundUser = DUMMY_USERS.find(
        (u) => u.email === email && u.password === password && u.role === role
      );

      if (!foundUser) {
        throw new Error("Invalid credentials or user not found");
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Save user to local storage
      localStorage.setItem("eventify_user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword as User);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: "student" | "admin", adminCode?: string) => {
    setLoading(true);
    try {
      // Check if trying to register as admin
      if (role === "admin") {
        // Verify admin code
        if (!adminCode || adminCode !== ADMIN_REGISTRATION_CODE) {
          throw new Error("Invalid admin registration code");
        }
      }

      // Check if user already exists
      if (DUMMY_USERS.some((u) => u.email === email)) {
        throw new Error("User with this email already exists");
      }

      // In a real app, this would be a backend API call
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

// Dummy users for demonstration
const DUMMY_USERS = [
  { id: "1", name: "Admin User", email: "admin@eventify.com", password: "admin123", role: "admin" as const },
  { id: "2", name: "Student User", email: "student@eventify.com", password: "student123", role: "student" as const },
];
