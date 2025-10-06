-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- RLS policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Create listing_payments table
CREATE TABLE public.listing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'WLD',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_hash TEXT,
  listing_type TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for listing_payments
CREATE INDEX idx_listing_payments_product ON public.listing_payments(product_id);
CREATE INDEX idx_listing_payments_seller ON public.listing_payments(seller_id);
CREATE INDEX idx_listing_payments_status ON public.listing_payments(payment_status);

-- Enable RLS on listing_payments
ALTER TABLE public.listing_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for listing_payments
CREATE POLICY "Users can view their own listing payments"
ON public.listing_payments FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Users can create listing payments"
ON public.listing_payments FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Update products table RLS to allow creating inactive products
CREATE POLICY "Authenticated users can create inactive products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND status = 'inactive');

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
USING (seller_id IN (SELECT id FROM public.sellers WHERE user_profile_id = auth.uid()));

-- Trigger for listing_payments updated_at
CREATE TRIGGER update_listing_payments_updated_at
BEFORE UPDATE ON public.listing_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();