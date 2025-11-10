import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useListingFee = () => {
  return useQuery({
    queryKey: ['listing-fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .in('config_key', ['payment_currencies', 'listing_fee']);
      
      if (error) throw error;

      const config: Record<string, any> = {};
      data?.forEach((item) => {
        config[item.config_key] = item.config_value;
      });

      // Extract available currencies from payment_currencies.default
      const availableCurrencies = config.payment_currencies?.default || ['WLD'];
      const fees = config.listing_fee || { WLD: 0.5, USDC: 1.0 };

      return {
        availableCurrencies, // e.g., ['WLD'] or ['WLD', 'USDC']
        fees,                 // e.g., { WLD: 0.5, USDC: 1.0 }
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
