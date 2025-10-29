import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // First get product to access images
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single();

      // Delete product (will cascade delete listing_payments due to foreign key)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;

      // Delete images from storage
      if (product?.images && product.images.length > 0) {
        const imageUrls = product.images as string[];
        const filePaths = imageUrls.map(url => {
          const urlParts = url.split('/product-images/');
          return urlParts[1];
        }).filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage
            .from('product-images')
            .remove(filePaths);
        }
      }

      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });
};
