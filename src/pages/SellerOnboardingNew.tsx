

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
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

import countryTelData from 'country-telephone-data'; // provides allCountries array
import { parsePhoneNumberFromString, AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
// import 'country-telephone-data/dist/country-telephone-data.min.css';

/**
 * Behavior summary:
 * - User picks a country from a searchable combobox (full country name).
 * - When they pick a country we set:
 *     form.country = ISO_CODE (e.g., "KE")
 *     selectedCallingCode = calling code string (e.g., "254")
 * - Phone input is split:
 *     - Left: readonly select showing +<callingCode> with dropdown to change code if desired
 *     - Right: numeric input for national number
 * - When submitting we compose full E.164 phone: `+{callingCode}{nationalNumber}` and validate via libphonenumber-js
 * - If phone optional in the future: you can make phone not required in schema; validation will run only when phone provided.
 */

const sellerOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional(),
  // store ISO country code like "KE"
  country: z.string().min(2, 'Country is required'),
  // phone will be validated using custom refinement below
  phone_national: z.string().min(1, 'Phone number is required'), // the national part (without calling code)
  phone_calling_code: z.string().min(1, 'Calling code required'), // e.g. "254"
}).superRefine((vals, ctx) => {
  // compose E.164
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
});

type SellerOnboardingFormData = z.infer<typeof sellerOnboardingSchema>;

/* Build countries list from country-telephone-data
   countryTelData.allCountries is an array with fields like:
   { name: 'Kenya', iso2: 'ke', dialCode: '254', priority: 0, areaCodes: null }
*/
const buildCountryList = () => {
  const raw: any[] = (countryTelData as any).allCountries || [];
  return raw.map((c) => ({
    name: c.name,
    iso2: c.iso2?.toUpperCase(),
    dialCode: c.dialCode,
    // show flag emoji if desired (simple emoji from iso)
    flag: isoToFlagEmoji(c.iso2?.toUpperCase()),
  }));
};

// helper to get flag emoji from ISO code
function isoToFlagEmoji(iso?: string) {
  if (!iso) return '';
  // A -> 0x1F1E6
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

  const countries = useMemo(() => buildCountryList(), []);
  const [countryQuery, setCountryQuery] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // selected country object
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; iso2: string; dialCode: string; flag: string } | null>(null);

  const form = useForm<SellerOnboardingFormData>({
    resolver: zodResolver(sellerOnboardingSchema),
    defaultValues: {
      name: '',
      email: '',
      city: '',
      state: '',
      country: '',
      phone_national: '',
      phone_calling_code: '',
    },
  });

  // states for the selected country ISO (keep using ISO for getStatesForCountry)
  const selectedISO = selectedCountry?.iso2 || '';
  const states = selectedISO ? getStatesForCountry(selectedISO) : [];

  // Filtered list for combobox search
  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => {
      return c.name.toLowerCase().includes(q) || (c.iso2 && c.iso2.toLowerCase().includes(q)) || (c.dialCode && c.dialCode.includes(q));
    });
  }, [countryQuery, countries]);

  // When user selects a country from the combobox
  const handleSelectCountry = (c: { name: string; iso2: string; dialCode: string; flag: string }) => {
    setSelectedCountry(c);
    setCountryDropdownOpen(false);
    // set form values: store ISO code in country, and set calling code
    form.setValue('country', c.iso2, { shouldValidate: true, shouldDirty: true });
    form.setValue('phone_calling_code', c.dialCode, { shouldValidate: true, shouldDirty: true });
    // reset national number when switching country
    form.setValue('phone_national', '', { shouldValidate: false });
  };

  // If user manually changes calling code via the left select (we provide ability)
  const handleCallingCodeChange = (newCode: string) => {
    form.setValue('phone_calling_code', newCode, { shouldValidate: true, shouldDirty: true });
    // try to keep country in sync if there is a single country for that calling code
    const matches = countries.filter((ct) => ct.dialCode === newCode);
    if (matches.length === 1) {
      handleSelectCountry(matches[0]);
    } else {
      // ambiguous — clear selectedCountry but keep calling code
      setSelectedCountry(null);
      form.setValue('country', '');
    }
  };

  // Nice helper to render display country name (use Intl.DisplayNames when available)
  const displayCountryName = (iso?: string, fallback?: string) => {
    if (!iso) return fallback || '';
    try {
      if ((Intl as any).DisplayNames) {
        const dn = new (Intl as any).DisplayNames(['en'], { type: 'region' });
        return dn.of(iso) || fallback || iso;
      }
    } catch { }
    return fallback || iso;
  };

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
      // Compose E.164
      const nationalDigits = data.phone_national.replace(/\D/g, '');
      const fullE164 = `+${data.phone_calling_code}${nationalDigits}`;

      // final check via libphonenumber-js
      const parsed = parsePhoneNumberFromString(fullE164);
      if (!parsed || !parsed.isValid()) {
        throw new Error('Invalid phone number');
      }

      const displayLocation = computeDisplayLocation(data.city, data.state, data.country);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: data.name,
          email: data.email,
          city: data.city,
          state: data.state || null,
          country: data.country, // ISO stored
          phone: parsed.number, // E.164 from libphonenumber-js
          display_location: displayLocation,
          is_seller: true,
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
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

                {/* Country combobox (searchable) */}
                {/* <FormItem>
                  <FormLabel>Country <span className="text-destructive">*</span></FormLabel>

                  <div className="relative">
                    <div className="flex items-center border rounded-md px-3 py-2 bg-white">
                      <div className="flex-1">
                        <Input
                          aria-label="Search country"
                          placeholder="Search country..."
                          className="w-full outline-none"
                          value={countryQuery}
                          onChange={(e) => {
                            setCountryQuery(e.target.value);
                            setCountryDropdownOpen(true);
                          }}
                          // onFocus={() => setCountryDropdownOpen(true)}
                        />
                      </div>
                      <div className="ml-2 text-muted">
                        <Search />
                      </div>
                    </div>

                    {/* dropdown */}
                    {/* {countryDropdownOpen && (
                      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow-lg">
                        {filteredCountries.length === 0 ? (
                          <div className="p-3 text-sm text-muted">No countries found</div>
                        ) : (
                          filteredCountries.map((c) => (
                            <button
                              key={c.iso2}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3"
                            >
                              <span className="text-lg">{c.flag}</span>
                              <div className="flex-1">
                                <div className="font-medium">{c.name}</div>
                                <div className="text-sm text-muted">+{c.dialCode} • {c.iso2}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )} */}
                  {/* </div> */}

                  <FormMessage />
                {/* </FormItem> */} 

                {/* Phone split input: calling code select + national number */}
                <div>
                  <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                  <div className="flex gap-2 items-start">
                    {/* Calling code selector */}
                    <div className="w-36">
                      <FormField
                        control={form.control}
                        name="phone_calling_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={(val) => {
                                  field.onChange(val);
                                  handleCallingCodeChange(val);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedCountry ? `+${selectedCountry.dialCode}` : 'Code'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {/* show a short list or all; for performance, show all countries but unique by dialCode */}
                                  {Array.from(
                                    new Map(countries.map((c) => [c.dialCode + '|' + c.iso2, c])).values()
                                  ).map((c) => (
                                    <SelectItem key={`${c.iso2}-${c.dialCode}`} value={c.dialCode}>
                                      <span className="mr-2">{c.flag}</span> +{c.dialCode} • {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
                                  // let user type freely, we can format lightly using AsYouType for the selected country
                                  const raw = e.target.value;
                                  field.onChange(raw);
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

                {/* Country display and states */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selected Country Code (stored) </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          // readOnly
                          value={selectedCountry ? `${selectedCountry.name} (${selectedCountry.iso2})` : field.value || ''}
                          onFocus={() => setCountryDropdownOpen(true)}
                        // className="bg-muted cursor-not-allowed"
                        />
                   
                      </FormControl>
                       {countryDropdownOpen && (
                <div className="relative">
                    {/* dropdown */}
                    <div className="flex items-center border rounded-md px-3 bg-white">
                      <div className="flex-1">
                        <input
                          aria-label="Search country"
                          placeholder="Search country..."
                          className="w-full outline-none"
                          value={countryQuery}
                          onChange={(e) => {
                            setCountryQuery(e.target.value);
                            setCountryDropdownOpen(true);
                          }}
                          // onFocus={() => setCountryDropdownOpen(true)}
                        />
                      </div>
                      {/* <div className="ml-2 text-muted">
                        <Search />
                      </div> */}
                    </div>
                    
                      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow-lg">
                        {filteredCountries.length === 0 ? (
                          <div className="p-3 text-sm text-muted">No countries found</div>
                        ) : (
                          filteredCountries.map((c) => (
                            <button
                              key={c.iso2}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3"
                            >
                              <span className="text-lg">{c.flag}</span>
                              <div className="flex-1">
                                <div className="font-medium">{c.name}</div>
                                <div className="text-sm text-muted">+{c.dialCode} • {c.iso2}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    
                  </div>
                  )}
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