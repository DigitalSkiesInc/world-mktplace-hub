import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Package, TrendingUp, Settings, DollarSign, FolderTree } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface NavigationCardProps {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}

const NavigationCard = ({ icon: Icon, title, description, onClick }: NavigationCardProps) => (
  <Card 
    className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
    onClick={onClick}
  >
    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export default function Admin() {
  const navigate = useNavigate();
  const { data: analytics, isLoading, refetch } = useAdminAnalytics();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Platform overview and management">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Users}
            label="Total Users"
            value={analytics?.totalUsers || 0}
          />
          <StatsCard
            icon={Store}
            label="Total Sellers"
            value={analytics?.totalSellers || 0}
          />
          <StatsCard
            icon={Package}
            label="Total Products"
            value={analytics?.totalProducts || 0}
          />
          <StatsCard
            icon={TrendingUp}
            label="Popular Category"
            value={analytics?.mostPopularCategory?.name || 'N/A'}
            subtitle={`${analytics?.mostPopularCategory?.count || 0} products`}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NavigationCard
            icon={Settings}
            title="Configuration"
            description="Manage platform settings"
            onClick={() => navigate('/admin/config')}
          />
          <NavigationCard
            icon={DollarSign}
            title="Payments"
            description="View listing payments"
            onClick={() => navigate('/admin/payments')}
          />
          <NavigationCard
            icon={Package}
            title="Listings"
            description="Manage products"
            onClick={() => navigate('/admin/listings')}
          />
          <NavigationCard
            icon={FolderTree}
            title="Categories"
            description="Manage categories"
            onClick={() => navigate('/admin/categories')}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
