import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { 
      name: string; 
      slug: string; 
      icon: string;
      parent_id?: string;
    }) => {
      const { error } = await supabase
        .from('categories')
        .insert([category]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to create category', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
