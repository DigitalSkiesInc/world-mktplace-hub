import { useEffect } from 'react';
import { Users, Store, Package, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { Loader2 } from 'lucide-react';

export default function Admin() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </AdminLayout>
  );
}
