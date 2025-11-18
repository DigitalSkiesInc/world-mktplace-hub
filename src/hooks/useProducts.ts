import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, DbProduct, DbCategory, DbSeller } from '@/types/Product';
import { getDefaultCountry } from '@/lib/utils';

export interface ProductFilters {
  categoryId?: string;
  searchQuery?: string;
  condition?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'oldest';
  country?: string | null;
}

export const useProducts = (filters: ProductFilters = {}, strictSearch: boolean = false) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {

      const MIN_PRODUCTS = 15;
    

        const buildBaseQuery = () => {
        let query = supabase
          .from('products_with_sellers')
          .select('*')
          .eq('status', 'active');

        // Apply filters
        if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
        if (filters.condition && filters.condition !== 'all')
          query = query.eq('condition', filters.condition);
        if (filters.searchQuery)
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
          );

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

        return query;
      };

      

      // let country = await getDefaultCountry(false);


      console.log("Fetching products for country:", filters);

    

      let { data:baseProducts, error } = filters.country? await buildBaseQuery().eq('country', filters.country).limit(MIN_PRODUCTS)
      : await buildBaseQuery().limit(MIN_PRODUCTS);

      if (error) throw error;

      delete filters.sortBy;
      

      console.log("Base products fetched:", baseProducts.length);

      if(!strictSearch && (filters.country && (Object.keys(filters).length === 0 && baseProducts.length < MIN_PRODUCTS) 
        || (Object.keys(filters).length !== 0 && baseProducts.length === 0))) {

          console.log("Fetching fallback products as country-specific results were insufficient.");

           const remaining = MIN_PRODUCTS - (baseProducts?.length || 0);

           const { data: fallbackProducts, error: fallbackError } = await buildBaseQuery()
           .neq('country', filters.country)
          .limit(remaining);

          // const { data: fallbackProducts, error: fallbackError } = await buildBaseQuery()
          //  .neq('country', country)
          // .limit(MIN_PRODUCTS);
        if (fallbackError) throw fallbackError;

        console.log("Fallback products fetched:", fallbackProducts.length);

        baseProducts = [...(baseProducts || []), ...(fallbackProducts || [])];

        // baseProducts = fallbackProducts;

        console.log("Base products on aggregration is:", baseProducts.length);

      }


       console.log("Base products final is:", baseProducts.length);
      // Transform database data to frontend format
      return baseProducts.map(transformDbProductToProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // First get product data
      const { data: productData, error: productError } = await supabase
        .from('products_with_sellers')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      // Then get seller profile data including phone
      const { data: sellerProfile, error: sellerError } = await supabase
        .from('user_profiles')
        .select('phone, allow_phone_contact')
        .eq('id', productData.seller_id)
        .single();

      // Transform the product
      const product = transformDbProductToProduct(productData);
      
      // Add seller phone info if available
      if (sellerProfile && !sellerError) {
        product.seller.phone = sellerProfile.phone;
        product.seller.allowPhoneContact = sellerProfile.allow_phone_contact;
      }

      return product;
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
    externalLink: dbProduct.external_link,
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