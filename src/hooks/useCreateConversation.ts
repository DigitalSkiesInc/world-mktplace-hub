import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { toast } from '@/hooks/use-toast';

export const useCreateConversation = () => {
  const { user } = useWorldApp();

  return useMutation({
    mutationFn: async ({ productId, sellerId }: { productId: string; sellerId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          product_id: productId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error && error.code === '23505') {
        // Unique violation → fetch the existing conversation
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('product_id', productId)
          .eq('buyer_id', user.id)
          .eq('seller_id', sellerId)
          .single();

        return existing;
      }

      if (error) throw error;
      return data;

    },
    onError: (error) => {
      toast({
        title: 'Failed to start conversation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
