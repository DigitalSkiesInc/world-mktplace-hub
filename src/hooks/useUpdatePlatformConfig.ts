import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useUpdatePlatformConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_config')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq('config_key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-config'] });
      toast({ title: 'Configuration updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to update configuration', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
