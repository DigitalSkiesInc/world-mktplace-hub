import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  TrendingUp, 
  Package, 
  Heart, 
  MessageCircle, 
  LogOut,
  DollarSign,
  PlusCircle,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useToast } from '@/hooks/use-toast';
import { listingFees } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from '@/hooks/useConversations';

const Profile: React.FC = () => {
  const { user, login, logout } = useWorldApp();
  const { toast } = useToast();
  const { data: conversations = [] } = useConversations();

 

  const handleLogin = async () => {
    try {
      await login();
      toast({
        title: "Connected!",
        description: "Successfully connected with your wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-20">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to World Marketplace
          </h2>
          <p className="text-muted-foreground mb-6">
            Connect with your wallet to start buying and selling securely
          </p>

          <Button 
            onClick={handleLogin}
            className="bg-gradient-primary hover:shadow-glow w-full"
          >
            Connect Wallet
          </Button>

          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-primary" size={20} />
              <span className="font-medium text-foreground">Secure & Verified</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All users are verified to ensure safe transactions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-6">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
              {user.profilePictureUrl ? (
                <img 
                  src={user.profilePictureUrl} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-white" size={40} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
                {user.isVerified && (
                  <Shield size={20} className="text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet size={14} />
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {user.isSeller && (
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Listings</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
              <p className="text-xs text-muted-foreground">Chats</p>
            </div>
            {user.isSeller && (
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{user.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions - Only show if user has seller profile */}
        {user.isSeller && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/list-item" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="mr-2" size={18} />
                  List Item
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Total Earnings - Only show if user has seller profile */}
        {user.isSeller && (
          <Card className="p-4 mb-6 bg-gradient-primary">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">0 WLD</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Links */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Account</h3>
          <div className="space-y-2">
            {user.isSeller && (
              <Link to="/my-listings" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-muted-foreground" />
                  <span className="text-foreground">My Listings</span>
                </div>
              </Link>
            )}
            <Link to="/favorites" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-muted-foreground" />
                <span className="text-foreground">Favorites</span>
              </div>
            </Link>
            <Link to="/chat" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-muted-foreground" />
                <span className="text-foreground">Messages</span>
              </div>
              {conversations.length > 0 && (
                <Badge className="bg-primary">{conversations.length}</Badge>
              )}
            </Link>
          </div>
        </Card>

        {/* Listing Fees Info - Only show if user has seller profile */}
        {user.isSeller && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Listing Fees</h3>
            <div className="space-y-3">
              {listingFees.map((fee) => (
                <div
                  key={fee.type}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground capitalize">{fee.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {fee.features.join(' • ')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {fee.price} {fee.currency}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Disconnect */}
        <Button
          variant="outline"
          onClick={logout}
          className="w-full"
        >
          <LogOut className="mr-2" size={18} />
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default Profile;
