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
  loginAsOrganizer: (eventId: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  const loginAsOrganizer = async (eventId: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid Event ID or password' };
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

  const loginAsAdmin = async (masterId: string, password: string) => {
    // For now, use hardcoded admin credentials
    // In production, this should be stored securely in environment variables or database
    if (masterId === 'MASTER_ADMIN' && password === 'admin123') {
      const authUser: AuthUser = {
        id: 'master_admin',
        type: 'admin',
        name: 'Master Administrator',
        masterId
      };

      setUser(authUser);
      localStorage.setItem('einvite_user', JSON.stringify(authUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid Master ID or password' };
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