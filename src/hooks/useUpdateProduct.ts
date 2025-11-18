import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UpdateProductData {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: 'WLD' | 'USD';
  images?: string[];
  category_id?: string;
  condition?: 'new' | 'second-hand';
  status?: 'active' | 'inactive' | 'paused' | 'sold';
  external_link?: string | null;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProductData) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });
};
