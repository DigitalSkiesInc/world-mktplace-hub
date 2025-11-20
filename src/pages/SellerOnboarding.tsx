// SellerOnboarding.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getStatesForCountry, computeDisplayLocation } from '@/lib/locationUtils';
import CountryPhoneInput from '@/components/ui/country-phone-input';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { useUploadProfilePicture } from '@/hooks/useUploadProfilePicture';

import countryTelData from 'country-telephone-data'; // provides allCountries array
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Schema and behavior notes unchanged (validation still uses Zod + libphonenumber-js)
 */
const sellerOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2, 'Country is required'),
  allow_phone_contact: z.boolean(),
  phone_national: z.string().optional(),
  phone_calling_code: z.string().optional(),
}).superRefine((vals, ctx) => {
  // Only validate phone if allow_phone_contact is true
  if (vals.allow_phone_contact) {
    if (!vals.phone_national || !vals.phone_calling_code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone_national'],
        message: 'Phone number is required when phone contact is enabled',
      });
      return;
    }
    
    try {
      const full = `+${vals.phone_calling_code}${vals.phone_national.replace(/\D/g, '')}`;
      const parsed = parsePhoneNumberFromString(full);
      if (!parsed || !parsed.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone_national'],
          message: 'Invalid phone number for selected country',
        });
      }
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone_national'],
        message: 'Invalid phone number',
      });
    }
  }
});

type SellerOnboardingFormData = z.infer<typeof sellerOnboardingSchema>;

/* Build countries list from country-telephone-data */
const buildCountryList = () => {
  const raw: any[] = (countryTelData as any).allCountries || [];
  return raw.map((c) => ({
    name: c.name,
    iso2: c.iso2?.toUpperCase(),
    dialCode: c.dialCode,
    flag: isoToFlagEmoji(c.iso2?.toUpperCase()),
  }));
};

function isoToFlagEmoji(iso?: string) {
  if (!iso) return '';
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const { uploadPicture, uploading } = useUploadProfilePicture();

  const countries = useMemo(() => buildCountryList(), []);

  const form = useForm<SellerOnboardingFormData>({
    resolver: zodResolver(sellerOnboardingSchema),
    defaultValues: {
      name: '',
      email: '',
      city: '',
      state: '',
      country: '',
      allow_phone_contact: false,
      phone_national: '',
      phone_calling_code: '',
    },
  });

  // derive selected country ISO from form (single source of truth)
  const selectedCountryISO = form.watch('country');
  const selectedCallingCode = form.watch('phone_calling_code');
  const allowPhoneContact = form.watch('allow_phone_contact');

  // states for the selected country ISO (use form value)
  const states = selectedCountryISO ? getStatesForCountry(selectedCountryISO) : [];

  const onSubmit = async (data: SellerOnboardingFormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to become a seller',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let phoneNumber = null;
      
      // Only process phone if allow_phone_contact is true
      if (data.allow_phone_contact && data.phone_national && data.phone_calling_code) {
        const nationalDigits = data.phone_national.replace(/\D/g, '');
        const fullE164 = `+${data.phone_calling_code}${nationalDigits}`;
        const parsed = parsePhoneNumberFromString(fullE164);
        if (!parsed || !parsed.isValid()) throw new Error('Invalid phone number');
        phoneNumber = parsed.number;
      }

      const displayLocation = computeDisplayLocation(data.city, data.state, data.country);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: data.name,
          email: data.email,
          city: data.city,
          state: data.state || null,
          country: data.country,
          phone: phoneNumber,
          allow_phone_contact: data.allow_phone_contact,
          display_location: displayLocation,
          is_seller: true,
          profile_picture_url: profilePictureUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your seller profile has been created',
      });

      navigate('/list-product');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create seller profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Become a Seller</CardTitle>
            <CardDescription>
              Tell us about yourself to start selling on the platform. Fields marked with * are required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <ProfilePictureUpload
                currentImageUrl={profilePictureUrl || undefined}
                onUpload={async (file) => {
                  if (!user?.id) return;
                  const url = await uploadPicture(file, user.id);
                  if (url) setProfilePictureUrl(url);
                }}
                uploading={uploading}
                userName={user?.username || 'User'}
              />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                {/* <Form.Field
                  // note: using your FormField wrapper (shadcn style). If your project requires FormField component usage, keep as originally.
                /> */}
                {/* For brevity: keep your other simple fields as before (Name, Email, etc.) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormMessage />

                {/* Country selector (kept as-is) */}
                <FormField
                  control={form.control}
                  name="country"
                  render={() => (
                    <FormItem>
                      <FormLabel>Country </FormLabel>
                      <FormControl>
                        <CountryPhoneInput
                          control={form.control}
                          nameCountry="country"
                          nameCallingCode="phone_calling_code"
                          onCountryChange ={(iso) => {
                            // when country changes, clear state field
                            form.setValue('country', iso);
                          }}
                          defaultCountryISO={"undefined"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Los Angeles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State/Province auto appears */}
                {states && states.length > 0 && (
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((s) => (
                              <SelectItem key={s.code} value={s.code}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Phone opt-in checkbox */}
                <FormField
                  control={form.control}
                  name="allow_phone_contact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Allow buyers to contact you via phone
                        </FormLabel>
                        {/* <p className="text-sm text-muted-foreground">
                          Your phone number will be shared with potential buyers
                        </p> */}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Phone split input: only shown if checkbox is checked */}
                {allowPhoneContact && (
                  <div>
                    <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                    <div className="flex gap-2 items-start">
                      {/* Read-only calling code display (disabled input style) */}
                      <div className="w-36">
                        <FormField
                          control={form.control}
                          name="phone_calling_code"
                          render={({ field }) => {
                            // Find country info to build display string
                            const iso = form.getValues('country') || selectedCountryISO || '';
                            const countryObj = countries.find((c) => c.iso2 === iso);
                            const flag = countryObj?.flag || '';
                            const displayCountryName = countryObj?.name || '';
                            const dial = field.value || selectedCallingCode || '';
                            const displayText = `${flag} +${dial}${displayCountryName ? ' • ' + displayCountryName : ''}`;

                            return (
                              <FormItem>
                                <FormControl>
                                  <Input value={displayText} disabled aria-disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>

                      {/* National number input */}
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="phone_national"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  inputMode="tel"
                                  placeholder="712345678"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Continue to List Product'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
