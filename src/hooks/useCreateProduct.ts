import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  currency: 'WLD' | 'USD';
  images: string[];
  category_id: string;
  condition: 'new' | 'second-hand';
  seller_id: string;
  external_link?: string | null;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          status: 'inactive',
          views: 0,
          is_featured: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Draft Created',
        description: 'Your product draft has been saved.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    },
  });
};
