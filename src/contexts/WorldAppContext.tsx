import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// World App user interface
export interface WorldAppUser {
  id: string;
  nullifierHash: string;
  verificationLevel: 'orb' | 'device';
  isVerified: boolean;
  username?: string;
}

// World App authentication context
interface WorldAppContextType {
  user: WorldAppUser | null;
  isLoading: boolean;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => void;
  verifyWorldId: (proof: any, nullifierHash: string, verificationLevel: 'orb' | 'device') => Promise<void>;
  // Worldcoin payment stubs
  requestPayment: (amount: number, description: string) => Promise<{ success: boolean; txHash?: string }>;
  verifyPayment: (txHash: string) => Promise<boolean>;
}

const WorldAppContext = createContext<WorldAppContextType | undefined>(undefined);

interface WorldAppProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'world_app_user';

export const WorldAppProvider: React.FC<WorldAppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<WorldAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('Session restored:', parsedUser.id);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    setIsConnected(typeof window !== 'undefined');
  }, []);

  const verifyWorldId = async (
    proof: any,
    nullifierHash: string,
    verificationLevel: 'orb' | 'device'
  ): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Verifying World ID proof...');

      const { data, error } = await supabase.functions.invoke('verify-world-id', {
        body: {
          proof,
          nullifier_hash: nullifierHash,
          verification_level: verificationLevel,
        },
      });

      if (error) throw error;

      if (data.success && data.user) {
        const worldAppUser: WorldAppUser = {
          id: data.user.id,
          nullifierHash: data.user.nullifier_hash,
          verificationLevel: data.user.verification_level,
          isVerified: data.user.is_verified,
        };

        setUser(worldAppUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(worldAppUser));
        console.log('World ID verification successful:', worldAppUser);
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('World ID verification failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    // This is a placeholder - actual login happens via IDKitWidget
    throw new Error('Use IDKitWidget for login');
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    console.log('World App logout successful');
  };

  // Mock Worldcoin payment functions
  const requestPayment = async (amount: number, description: string): Promise<{ success: boolean; txHash?: string }> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Worldcoin payment SDK
      console.log(`Requesting payment: ${amount} WLD for ${description}`);
      
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}`;
      
      return {
        success: true,
        txHash: mockTxHash
      };
    } catch (error) {
      console.error('Worldcoin payment failed:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (txHash: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual Worldcoin verification
      console.log(`Verifying payment: ${txHash}`);
      
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  };

  const value: WorldAppContextType = {
    user,
    isLoading,
    isConnected,
    login,
    logout,
    verifyWorldId,
    requestPayment,
    verifyPayment
  };

  return (
    <WorldAppContext.Provider value={value}>
      {children}
    </WorldAppContext.Provider>
  );
};

export const useWorldApp = (): WorldAppContextType => {
  const context = useContext(WorldAppContext);
  if (context === undefined) {
    throw new Error('useWorldApp must be used within a WorldAppProvider');
  }
  return context;
};