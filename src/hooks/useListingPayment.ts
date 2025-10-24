import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreatePaymentData {
  product_id: string;
  seller_id: string;
  amount: number;
  currency: string;
}

export const useListingPayment = () => {


  const initiatePayment = async (paymentDetails: {
    productId: string;
    sellerId: string;
    paymentType: string;
  }) => {
    const res = await fetch('http://localhost:3001/api/initiate-payment', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
        }
      );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment initiation failed');
    return data;
    }


   const verifyPayment = async (reference: string) => {
    const res = await fetch('http://localhost:3001/api/verify-payment', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
        }
      );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
    }    


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

  return { initiatePayment,verifyPayment,createPayment, mockPayment };
};
