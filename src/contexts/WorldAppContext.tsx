import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface WorldAppUser {
  id: string;
  walletAddress: string;
  username: string;
  profilePictureUrl?: string;
  isVerified: boolean;
}
interface AppUser extends WorldAppUser{

  isSeller: boolean,
  rating?:number
}

interface WorldAppContextType {
  user: AppUser | null;
  isLoading: boolean;
  isConnected: boolean;
  login: (worldcoinUser?: {
    walletAddress: string;
    username: string;
    profilePictureUrl?: string;
  },
    nonce?: string

  ) => Promise<void>;
  logout: () => void;
}

const WorldAppContext = createContext<WorldAppContextType | undefined>(undefined);


export const signInUser = async ({
  walletAddress, username, profilePictureUrl
}: {
  walletAddress: string;
  username: string;
  profilePictureUrl?: string;
}, nonce: string) => {
  try {
    const res = await fetch('https://marketplace-backend-sdl0.onrender.com/api/v1/signin', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, username, profilePictureUrl, nonce },

      ),
    }
  );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Worldcoin sign-in failed');



    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token || ''
    });


    localStorage.setItem('worldapp_user_id', data.userId);
    return data;
  } catch (err) {
    console.error('Worldcoin sign-in error:', err);
    throw err;
  }
};

export const WorldAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load user from localStorage or set default dev user
    const loadUser = async () => {
      const storedUserId = localStorage.getItem('worldapp_user_id');
      const userId = storedUserId ;

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
            isSeller: data.is_seller,
            rating: data.rating
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


  const fetchUserProfile = async (userId: string) => {
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
        isSeller:data.is_seller,
        rating:data.rating

      });
    }
    setIsLoading(false);
  };

  const login =  async (worldcoinUser?: {
    walletAddress: string;
    username: string;
    profilePictureUrl?: string;
  },
    nonce?: string
  ) => {
    setIsLoading(true);
    try {
       if (!worldcoinUser) throw new Error('Worldcoin user info required');
      
       const data= await signInUser(worldcoinUser, nonce);

       const { userId } =data

      if (!userId) throw new Error('Login failed, no user ID returned');
   
      await fetchUserProfile(userId);
      setIsConnected(true);

      toast({
        title: "Connected!",
        description: "Successfully connected with your wallet",
      });



    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  

  const logout = async() => {
    await supabase.auth.signOut();
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
