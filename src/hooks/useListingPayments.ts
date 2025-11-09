import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFilters {
  status?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useListingPayments = (page: number, filters: PaymentFilters) => {
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  return useQuery({
    queryKey: ['listing-payments', page, filters],
    queryFn: async () => {
      let query = supabase
        .from('listing_payments')
        .select(`
          *,
          products(title, id),
          public_profiles!seller_id(username, id)
        `, { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) query = query.eq('payment_status', filters.status);
      if (filters.currency) query = query.eq('currency', filters.currency);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, total: count };
    },
  });
};
