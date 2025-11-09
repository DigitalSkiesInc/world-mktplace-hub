import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact', head: true });

      // Total sellers
      const { count: totalSellers } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_seller', true);

      // Total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Most popular category
      const { data: products } = await supabase
        .from('products')
        .select('category_id, categories(name, slug)')
        .not('category_id', 'is', null);

      const categoryCount: Record<string, { count: number; name: string; slug: string }> = {};
      products?.forEach((product: any) => {
        const categoryId = product.category_id;
        if (categoryId && product.categories) {
          if (!categoryCount[categoryId]) {
            categoryCount[categoryId] = {
              count: 0,
              name: product.categories.name,
              slug: product.categories.slug,
            };
          }
          categoryCount[categoryId].count += 1;
        }
      });

      const mostPopularCategory = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b.count - a.count)[0];

      return {
        totalUsers: totalUsers || 0,
        totalSellers: totalSellers || 0,
        totalProducts: totalProducts || 0,
        mostPopularCategory: mostPopularCategory 
          ? { 
              id: mostPopularCategory[0], 
              count: mostPopularCategory[1].count,
              name: mostPopularCategory[1].name,
              slug: mostPopularCategory[1].slug,
            }
          : null,
      };
    },
    enabled: false,
  });
};
