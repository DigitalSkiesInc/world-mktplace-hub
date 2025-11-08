import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlatformConfig = () => {
  return useQuery({
    queryKey: ['platform-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*');

      if (error) throw error;

      const config: Record<string, any> = {};
      data?.forEach((item) => {
        config[item.config_key] = item.config_value;
      });

      return config;
    },
  });
};
