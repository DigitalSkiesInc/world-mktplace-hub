import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductForChat = (productId: string | null, sellerId: string | null) => {
  return useQuery({
    queryKey: ['productForChat', productId, sellerId],
    queryFn: async () => {
      if (!productId || !sellerId) return null;

      // Fetch product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, title, images, price, currency')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Fetch seller from public_profiles view
      const { data: seller, error: sellerError } = await supabase
        .from('public_profiles')
        .select('id, username, profile_picture_url, is_verified')
        .eq('id', sellerId)
        .single();

      if (sellerError) throw sellerError;

      if (!product || !seller) return null;

      return {
        product: {
          id: product.id,
          title: product.title,
          images: product.images,
          price: product.price,
          currency: product.currency,
        },
        participant: {
          id: seller.id,
          username: seller.username,
          profilePictureUrl: seller.profile_picture_url,
          isVerified: seller.is_verified,
        },
      };
    },
    enabled: !!productId && !!sellerId,
  });
};
