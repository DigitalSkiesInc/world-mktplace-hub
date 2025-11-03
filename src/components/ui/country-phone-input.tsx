import React, { useEffect, useMemo, useState } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import { Controller } from 'react-hook-form';
import { getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { getDefaultCountry } from '@/lib/utils';
import { get } from 'http';


type Props = {
  control: any; // react-hook-form control
  nameCountry: string; // form field name for country ISO (e.g. "country")
  nameCallingCode: string; // form field name for calling code (e.g. "phone_calling_code")
  defaultCountryISO?: string; // optional override for default ISO (e.g. "KE")
  onCountryChange: (iso: string) => void; // parent callback
  className?: string;
};

function isLikelyIso(code?: string): code is CountryCode {
  return !!code && code.length === 2;
}
function getDefaultCountryFromNavigator(fallbackIso = 'KE') {
  try {
    const nav = (navigator.language || (navigator as any).userLanguage || '') as string;
    // navigator.language examples: "en-KE", "en-US", "sw-KE", "en"
    const parts = nav.split(/[-_]/);
    if (parts.length >= 2) {
      const region = parts[1];
      if (region && region.length === 2) return region.toUpperCase();
    }
    // sometimes navigator.languages array
    const langs = (navigator.languages || []) as string[];
    for (const l of langs) {
      const p = l.split(/[-_]/);
      if (p.length >= 2 && p[1].length === 2) return p[1].toUpperCase();
    }
  } catch (e) {
    // ignore
  }
  return fallbackIso;
}

export default function CountryPhoneInput({
  control,
  nameCountry,
  nameCallingCode,
  defaultCountryISO,
  onCountryChange,
  className = '',
}: Props) {
  const navDefault = useMemo(() => getDefaultCountryFromNavigator('KE'), []);
  const [selected, setSelected] = useState<string>(defaultCountryISO?.toUpperCase() || navDefault);

  useEffect(() => {
    // when mounted, set initial calling code into form if possible
    const init = async () => {
    const iso = await getDefaultCountry(true);
    let code = '';

    try {
      const isoForLookup = isLikelyIso(selected) ? selected : iso; // use iso here instead of navDefault
      code = getCountryCallingCode(isoForLookup as CountryCode);
    } catch (e) {
      code = '';
    }

    onCountryChange(iso);
  };

  // Call it immediately
  init();
  }, []); // only once on mount

  

  // small wrapper to style flags select to fit shadcn look
  const flagsWrapperClass = `w-full rounded-md bg-white ${className}`;

  return (
    <div className="w-full">
      {/* Country selector (react-flags-select is searchable) */}
      <div className={flagsWrapperClass}>
        <Controller
          control={control}
          name={nameCountry}
          defaultValue={selected}
          render={({ field: { value, onChange } }) => {
            // keep the selected iso in sync with form value if parent sets it
            useEffect(() => {
              if (value && value !== selected) setSelected(value);
            }, [value]);

            return (
              <div>
                <div >
                  <ReactFlagsSelect
                    countries={undefined} // all countries
                    selected={selected}
                    onSelect={(iso) => {
                      const upper = (iso || '').toUpperCase();
                      onCountryChange(upper)
                    }}
                    searchable={true}
                    showSelectedLabel={true}
                    showOptionsLabel={true}
                    placeholder="Select country"
                    selectedSize={16}
                    optionsSize={14}
                    searchablePlaceholder="Type to search..."
                    className="react-flags-select--custom"
                  />
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Hidden controller for calling code. We render a Controller to keep the calling code in the form.
          When the selected country changes we compute the calling code and update the calling code field. */}
      <Controller
        control={control}
        name={nameCallingCode}
        defaultValue={(() => {
          try {
            return isLikelyIso(selected || navDefault)? getCountryCallingCode((selected || navDefault) as CountryCode) : '';
          } catch {
            return '';
          }
        })()}
        render={({ field: { value, onChange } }) => {
          // whenever `selected` changes, compute calling code and update form value
          useEffect(() => {
            try {
    
              const isoForLookup = isLikelyIso(selected) ? selected : navDefault;
              const code = getCountryCallingCode(isoForLookup as CountryCode);
              onChange(String(code));
            } catch {
              onChange('');
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [selected]);
          return null; // we don't render a visible input for calling code here
        }}
      />
    </div>
  );
}
