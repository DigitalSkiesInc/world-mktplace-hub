import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


export const useListingFeePaymentConfig = () => {
  return useQuery({
    queryKey: ['listing-fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_config')
        .select('config_value')
        .eq('config_key', 'listing_payment_config')
        .single()

      if (error) throw error;

      const configValue = data.config_value as { currencies: Record<string, any> };


       const availableCurrencies = Object.entries(configValue.currencies||{})
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);


      return availableCurrencies
      
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
