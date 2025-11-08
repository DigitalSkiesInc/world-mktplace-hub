import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductFilters {
  status?: string;
  category_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useAdminProducts = (page: number, filters: ProductFilters) => {
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  return useQuery({
    queryKey: ['admin-products', page, filters],
    queryFn: async () => {
      let query = supabase
        .from('products_with_sellers')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, total: count };
    },
  });
};
