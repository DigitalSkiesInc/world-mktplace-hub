-- Create user_profiles table for World ID authentication
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash TEXT NOT NULL UNIQUE,
  verification_level TEXT NOT NULL CHECK (verification_level IN ('orb', 'device')),
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Link user_profiles to sellers table
ALTER TABLE public.sellers
ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_nullifier_hash ON public.user_profiles(nullifier_hash);
CREATE INDEX idx_sellers_user_profile_id ON public.sellers(user_profile_id);