export interface Country {
  code: string;
  name: string;
  hasStates: boolean;
}

export interface State {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', hasStates: true },
  { code: 'CA', name: 'Canada', hasStates: true },
  { code: 'GB', name: 'United Kingdom', hasStates: false },
  { code: 'AU', name: 'Australia', hasStates: true },
  { code: 'DE', name: 'Germany', hasStates: false },
  { code: 'FR', name: 'France', hasStates: false },
  { code: 'IN', name: 'India', hasStates: true },
  { code: 'BR', name: 'Brazil', hasStates: true },
  { code: 'MX', name: 'Mexico', hasStates: true },
  { code: 'KE', name: 'Kenya', hasStates: false },
  { code: 'NG', name: 'Nigeria', hasStates: true },
  { code: 'ZA', name: 'South Africa', hasStates: false },
  { code: 'JP', name: 'Japan', hasStates: false },
  { code: 'CN', name: 'China', hasStates: false },
  { code: 'ES', name: 'Spain', hasStates: false },
  { code: 'IT', name: 'Italy', hasStates: false },
  { code: 'NL', name: 'Netherlands', hasStates: false },
  { code: 'SE', name: 'Sweden', hasStates: false },
  { code: 'CH', name: 'Switzerland', hasStates: false },
  { code: 'AR', name: 'Argentina', hasStates: false },
];

export const US_STATES: State[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export const CANADIAN_PROVINCES: State[] = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
];

export const AUSTRALIAN_STATES: State[] = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'WA', name: 'Western Australia' },
];

export function getStatesForCountry(countryCode: string): State[] {
  switch (countryCode) {
    case 'US':
      return US_STATES;
    case 'CA':
      return CANADIAN_PROVINCES;
    case 'AU':
      return AUSTRALIAN_STATES;
    default:
      return [];
  }
}

export function computeDisplayLocation(
  city: string,
  state: string | undefined,
  countryCode: string
): string {
  if (!city || !countryCode) return '';

  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return '';

  if (country.hasStates && state) {
    return `${city}, ${state}, ${countryCode}`;
  }

  return `${city}, ${countryCode}`;
}

/**
 * Format phone number for display
 * Handles international format with country code
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If starts with country code, format accordingly
  if (phoneNumber.startsWith('+')) {
    // Extract country code (1-3 digits)
    const countryCodeMatch = cleaned.match(/^(\d{1,3})(\d+)/);
    if (countryCodeMatch) {
      const [, countryCode, rest] = countryCodeMatch;
      
      // Format US/Canada numbers
      if (countryCode === '1' && rest.length === 10) {
        return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      }
      
      // Generic international format
      return `+${countryCode} ${rest.replace(/(\d{3})(?=\d)/g, '$1 ')}`;
    }
  }
  
  // Default: just add spaces every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
}
