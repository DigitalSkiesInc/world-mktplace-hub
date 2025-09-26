-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'WLD' CHECK (currency IN ('WLD', 'USD')),
  images TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID NOT NULL REFERENCES public.categories(id),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'second-hand')),
  seller_id UUID NOT NULL REFERENCES public.sellers(id),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'inactive')),
  views INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create public read policies for marketplace data (no auth needed for browsing)
CREATE POLICY "Categories are publicly readable" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Sellers are publicly readable" 
ON public.sellers FOR SELECT 
USING (true);

CREATE POLICY "Products are publicly readable" 
ON public.products FOR SELECT 
USING (true);

-- Create policies for inserting (for when we add auth later)
CREATE POLICY "Anyone can create categories" 
ON public.categories FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can create seller profiles" 
ON public.sellers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can create products" 
ON public.products FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created_at ON public.products(created_at);
CREATE INDEX idx_products_title_search ON public.products USING gin(to_tsvector('english', title));
CREATE INDEX idx_products_description_search ON public.products USING gin(to_tsvector('english', description));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories data
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Phones & Tablets', 'phone-tablets', '📱'),
  ('Electronics', 'electronics', '🖥️'),
  ('Fashion', 'fashion', '👕'),
  ('Home & Furniture', 'home-furniture', '🏠'),
  ('Animals & Pets', 'animal-pets', '🐱'),
  ('Health & Beauty', 'health-beauty', '💄'),
  ('Sports', 'sports', '⚽'),
  ('Vehicles', 'vehicles', '🚗'),
  ('Books & Media', 'books-media', '📚'),
  ('Toys & Games', 'toys-games', '🎮'),
  ('Art & Collectibles', 'art-collectibles', '🎨');

-- Insert initial sellers data
INSERT INTO public.sellers (username, rating, is_verified) VALUES
  ('TechDealer', 4.9, true),
  ('VintageCollector', 4.7, true),
  ('SneakerHead', 4.8, true);

-- Insert initial products data
INSERT INTO public.products (title, description, price, currency, images, category_id, condition, seller_id, location, is_featured, views) VALUES
  (
    'iPhone 15 Pro Max - Space Black',
    'Brand new iPhone 15 Pro Max, 256GB, Space Black. Never used, still in original packaging with all accessories.',
    850,
    'WLD',
    ARRAY['/product-phone.jpg'],
    (SELECT id FROM public.categories WHERE slug = 'phone-tablets'),
    'new',
    (SELECT id FROM public.sellers WHERE username = 'TechDealer'),
    'San Francisco, CA',
    true,
    124
  ),
  (
    'Vintage Canon AE-1 Camera',
    'Beautiful vintage Canon AE-1 35mm film camera in excellent working condition. Perfect for film photography enthusiasts.',
    200,
    'WLD',
    ARRAY['/product-camera.jpg'],
    (SELECT id FROM public.categories WHERE slug = 'electronics'),
    'second-hand',
    (SELECT id FROM public.sellers WHERE username = 'VintageCollector'),
    'New York, NY',
    false,
    89
  ),
  (
    'Nike Air Jordan 1 Retro High',
    'Classic Air Jordan 1 in Chicago colorway. Size 10.5, worn a few times but in great condition. No box included.',
    180,
    'WLD',
    ARRAY['/product-sneakers.jpg'],
    (SELECT id FROM public.categories WHERE slug = 'fashion'),
    'second-hand',
    (SELECT id FROM public.sellers WHERE username = 'SneakerHead'),
    'Los Angeles, CA',
    true,
    67
  );