import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, DbProduct, DbCategory, DbSeller } from '@/types/Product';

export interface ProductFilters {
  categoryId?: string;
  searchQuery?: string;
  condition?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'oldest';
}

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products_with_sellers')
        .select('*')
        .eq('status', 'active');


      // Apply filters
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }

      // Apply search
      if (filters.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating_desc':
          query = query.order('seller_rating', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform database data to frontend format
      return data.map(transformDbProductToProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_with_sellers')   // instead of 'products'
        .select('*')
        .eq('id', id)
        .single();


      if (error) throw error;

      return transformDbProductToProduct(data);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map((category: DbCategory) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        parentId: category.parent_id,
      }));
    },
  });
};

function transformDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: dbProduct.price,
    currency: dbProduct.currency,
    images: dbProduct.images,
    category: {
      id: dbProduct.category_id,
      name: dbProduct.category_name,
      slug: dbProduct.category_slug,
      icon: dbProduct.category_icon,
      parentId: dbProduct.category_parent_id,
    },
    condition: dbProduct.condition,
    seller: {
      id: dbProduct.seller_id,
      username: dbProduct.seller_username,
      rating: dbProduct.sellers_rating,
      isVerified: dbProduct.sellers_is_verified,
    },
    location: dbProduct.location,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    status: dbProduct.status,
    views: dbProduct.views,
    isFeatured: dbProduct.is_featured,
  };
}