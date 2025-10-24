import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useListingFee = () => {
  return useQuery({
    queryKey: ['listing-fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_fees')
        .select('*')
        .eq('payment_type', 'listing_fee')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
