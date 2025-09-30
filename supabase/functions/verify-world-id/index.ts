import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proof, nullifier_hash, verification_level } = await req.json();

    console.log('Verifying World ID proof:', { nullifier_hash, verification_level });

    // Verify the proof with World ID
    const verifyResponse = await fetch('https://developer.worldcoin.org/api/v1/verify/app_03e9958d235cae3a9c848460e65daef3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof,
        nullifier_hash,
        verification_level,
      }),
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.error('World ID verification failed:', errorData);
      throw new Error('World ID verification failed');
    }

    const verificationResult = await verifyResponse.json();
    console.log('World ID verification successful:', verificationResult);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('nullifier_hash', nullifier_hash)
      .maybeSingle();

    let userProfile;

    if (existingProfile) {
      console.log('Existing user profile found:', existingProfile.id);
      userProfile = existingProfile;
    } else {
      // Create new user profile
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          nullifier_hash,
          verification_level,
          is_verified: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }

      console.log('New user profile created:', newProfile.id);
      userProfile = newProfile;

      // Create corresponding seller profile
      const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
          user_profile_id: newProfile.id,
          username: `user_${nullifier_hash.substring(0, 8)}`,
          is_verified: verification_level === 'orb',
        });

      if (sellerError) {
        console.error('Error creating seller profile:', sellerError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userProfile.id,
          nullifier_hash: userProfile.nullifier_hash,
          verification_level: userProfile.verification_level,
          is_verified: userProfile.is_verified,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-world-id function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});