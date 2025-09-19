import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Star, 
  Package, 
  Heart, 
  Settings, 
  Plus,
  TrendingUp,
  MessageCircle,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { mockProducts, listingFees } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, login, logout, isLoading, requestPayment } = useWorldApp();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await login();
      toast({
        title: "Connected!",
        description: "Successfully connected to World App",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to World App",
        variant: "destructive",
      });
    }
  };

  const handleTestPayment = async () => {
    try {
      const result = await requestPayment(2.0, "Featured listing fee");
      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: `Transaction: ${result.txHash?.substring(0, 8)}...`,
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process Worldcoin payment",
        variant: "destructive",
      });
    }
  };

  const userStats = {
    listings: 3,
    sales: 8,
    purchases: 12,
    rating: 4.8,
    totalEarnings: 1250,
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
            Connect with World ID to start buying and selling securely
          </p>

          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="bg-gradient-primary hover:shadow-glow w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect World ID'}
          </Button>

          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-primary" size={20} />
              <span className="font-medium text-foreground">Secure & Verified</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All users are verified through World ID to ensure safe transactions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-marketplace px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  {user.username}
                </h1>
                <Shield className="text-primary" size={18} />
                <Badge variant="default" className="bg-success">
                  {user.verificationLevel}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Member since 2024
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <Settings size={20} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{userStats.listings}</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{userStats.sales}</div>
            <div className="text-xs text-muted-foreground">Sales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{userStats.purchases}</div>
            <div className="text-xs text-muted-foreground">Purchases</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star size={14} className="text-warning fill-current" />
              <span className="text-lg font-bold text-foreground">{userStats.rating}</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/list">
              <Button variant="outline" className="w-full h-16 flex-col gap-2">
                <Plus size={24} />
                <span>List Item</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full h-16 flex-col gap-2"
              onClick={handleTestPayment}
              disabled={isLoading}
            >
              <Wallet size={24} />
              <span>Test Payment</span>
            </Button>
          </div>
        </section>

        {/* Earnings */}
        <section className="bg-gradient-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Total Earnings</h3>
            <TrendingUp className="text-success" size={20} />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {userStats.totalEarnings} WLD
          </div>
          <p className="text-sm text-muted-foreground">
            From {userStats.sales} successful sales
          </p>
        </section>

        {/* Menu Items */}
        <section>
          <div className="space-y-2">
            <Link to="/my-listings" className="flex items-center gap-4 p-4 bg-card rounded-xl hover:bg-muted transition-colors">
              <Package className="text-primary" size={24} />
              <div className="flex-1">
                <div className="font-medium text-foreground">My Listings</div>
                <div className="text-sm text-muted-foreground">Manage your items</div>
              </div>
              <Badge>{userStats.listings}</Badge>
            </Link>

            <Link to="/favorites" className="flex items-center gap-4 p-4 bg-card rounded-xl hover:bg-muted transition-colors">
              <Heart className="text-primary" size={24} />
              <div className="flex-1">
                <div className="font-medium text-foreground">Favorites</div>
                <div className="text-sm text-muted-foreground">Saved items</div>
              </div>
            </Link>

            <Link to="/chat" className="flex items-center gap-4 p-4 bg-card rounded-xl hover:bg-muted transition-colors">
              <MessageCircle className="text-primary" size={24} />
              <div className="flex-1">
                <div className="font-medium text-foreground">Messages</div>
                <div className="text-sm text-muted-foreground">Chat history</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Listing Fees Info */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Listing Fees</h2>
          <div className="space-y-3">
            {listingFees.map((fee) => (
              <div key={fee.type} className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground capitalize">{fee.type} Listing</h3>
                  <div className="text-lg font-bold text-primary">
                    {fee.price} {fee.currency}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {fee.features.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Logout */}
        <section>
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full"
          >
            Disconnect World ID
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Profile;