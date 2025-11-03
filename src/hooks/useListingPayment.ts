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
    const res = await fetch('https://marketplace-backend-sdl0.onrender.com/api/initiate-payment', {
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


   const verifyPayment = async (transactionDetails) => {
    const res = await fetch('https://marketplace-backend-sdl0.onrender.com/api/verify-payment', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: transactionDetails,
        }
      );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
    }    

  return { initiatePayment,verifyPayment };
};
