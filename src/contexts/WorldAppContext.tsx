import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WorldAppUser {
  id: string;
  walletAddress: string;
  username: string;
  profilePictureUrl?: string;
  isVerified: boolean;
}

interface WorldAppContextType {
  user: WorldAppUser | null;
  isLoading: boolean;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const WorldAppContext = createContext<WorldAppContextType | undefined>(undefined);

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export const WorldAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<WorldAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load user from localStorage or set default dev user
    const loadUser = async () => {
      const storedUserId = localStorage.getItem('worldapp_user_id');
      const userId = storedUserId || DEV_USER_ID;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) {
          setUser({
            id: data.id,
            walletAddress: data.wallet_address || '',
            username: data.username || 'Anonymous',
            profilePictureUrl: data.profile_picture_url || undefined,
            isVerified: data.is_verified,
          });
          setIsConnected(true);
          
          // Store in localStorage for persistence
          if (!storedUserId) {
            localStorage.setItem('worldapp_user_id', userId);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async () => {
    setIsLoading(true);
    // In development, just load the default user
    // In production, this would connect to Worldcoin wallet
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', DEV_USER_ID)
          .single();

        if (data && !error) {
          setUser({
            id: data.id,
            walletAddress: data.wallet_address || '',
            username: data.username || 'Anonymous',
            profilePictureUrl: data.profile_picture_url || undefined,
            isVerified: data.is_verified,
          });
          setIsConnected(true);
          localStorage.setItem('worldapp_user_id', DEV_USER_ID);
        }
      } catch (error) {
        console.error('Error logging in:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const logout = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem('worldapp_user_id');
  };

  return (
    <WorldAppContext.Provider
      value={{
        user,
        isLoading,
        isConnected,
        login,
        logout,
      }}
    >
      {children}
    </WorldAppContext.Provider>
  );
};

export const useWorldApp = () => {
  const context = useContext(WorldAppContext);
  if (context === undefined) {
    throw new Error('useWorldApp must be used within a WorldAppProvider');
  }
  return context;
};
