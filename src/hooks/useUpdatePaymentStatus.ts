import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      paymentId, 
      status, 
      notes 
    }: { 
      paymentId: string; 
      status: string; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('listing_payments')
        .update({
          payment_status: status,
          status_updated_by: user?.id,
          status_updated_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-payments'] });
      toast({ title: 'Payment status updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to update payment status', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
