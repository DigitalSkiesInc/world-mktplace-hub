import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreatePaymentData {
  product_id: string;
  seller_id: string;
  amount: number;
  listing_type: 'basic' | 'featured' | 'premium';
}

const LISTING_FEES = {
  basic: 0.5,
  featured: 2.0,
  premium: 5.0,
};

export const useListingPayment = () => {
  const queryClient = useQueryClient();

  const createPayment = useMutation({
    mutationFn: async (paymentData: CreatePaymentData) => {
      const { data, error } = await supabase
        .from('listing_payments')
        .insert({
          ...paymentData,
          currency: 'WLD',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create payment',
        variant: 'destructive',
      });
    },
  });

  const mockPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 90% success rate
      const success = Math.random() < 0.9;

      if (!success) {
        throw new Error('Payment failed. Please try again.');
      }

      // Update payment status
      const { data, error } = await supabase
        .from('listing_payments')
        .update({ 
          payment_status: 'completed',
          transaction_hash: `mock_${Math.random().toString(36).substring(2)}`,
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing_payments'] });
      toast({
        title: 'Payment Successful',
        description: 'Your listing is being reviewed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Payment processing failed',
        variant: 'destructive',
      });
    },
  });

  return { createPayment, mockPayment, LISTING_FEES };
};
