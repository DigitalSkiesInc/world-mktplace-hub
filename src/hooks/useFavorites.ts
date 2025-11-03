import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/Product';

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
           products_with_sellers!inner (
              id,
              title,
              description,
              price,
              currency,
              images,
              condition,
              status,
              category_id,
              category_name,
              category_slug,
              seller_id,
              seller_username,
              location,
              seller_rating,
              seller_is_verified
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

        

      if (error) throw error;
      return data.map(transformDbProductToProduct)|| [];
    },
  });
};


 function transformDbProductToProduct(favorite: any): Product {
  let product = favorite.products_with_sellers;
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    images: product.images,
    category: {
      id: product.category_id,
      name: product.category_name,
      slug: product.category_slug,
      icon: product.category_icon,
      parentId: product.category_parent_id,
    },
    condition: product.condition,
    seller: {
      id: product.seller_id,
      username: product.seller_username,
      rating: product.sellers_rating,
      isVerified: product.sellers_is_verified,
    },
    location: product.location,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    status: product.status,
    views: product.views,
    isFeatured: product.is_featured,
  };
}
