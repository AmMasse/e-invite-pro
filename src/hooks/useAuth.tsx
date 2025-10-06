import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthUser {
  id: string;
  type: 'organizer' | 'admin';
  name: string;
  eventId?: string;
  masterId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsOrganizer: (eventName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (masterId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('einvite_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('einvite_user');
      }
    }
    setLoading(false);
  }, []);

  const loginAsOrganizer = async (eventName: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('name', eventName)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return { success: false, error: 'Invalid Event Name or password' };
      }

      const authUser: AuthUser = {
        id: data.id,
        type: 'organizer',
        name: data.organizer_name,
        eventId: data.id
      };

      setUser(authUser);
      localStorage.setItem('einvite_user', JSON.stringify(authUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  };

  const loginAsAdmin = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      });

      if (error || !data?.success) {
        return { success: false, error: data?.error || 'Invalid username or password' };
      }

      const authUser: AuthUser = {
        id: data.admin.id,
        type: 'admin',
        name: data.admin.name,
        masterId: username
      };

      setUser(authUser);
      localStorage.setItem('einvite_user', JSON.stringify(authUser));
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('einvite_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginAsOrganizer,
      loginAsAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};