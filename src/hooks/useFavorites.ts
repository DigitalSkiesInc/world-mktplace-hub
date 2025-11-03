import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          products!inner (
            id,
            title,
            description,
            price,
            currency,
            images,
            condition,
            status,
            category_id,
            seller_id,
            is_featured,
            views,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};
