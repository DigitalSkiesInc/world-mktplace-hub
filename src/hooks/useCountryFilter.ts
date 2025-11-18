import { useState, useEffect } from 'react';
import { getDefaultCountry } from '@/lib/utils';

const STORAGE_KEY = 'user_country_filter_preference';

export const useCountryFilter = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null | undefined>(undefined);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCountryFilter = async () => {
      // Get detected country
      const detected = await getDefaultCountry(false);
      setDetectedCountry(detected || null);

      // Check for saved preference
      const savedPreference = localStorage.getItem(STORAGE_KEY);
      if (savedPreference === 'null') {
        // User explicitly chose to show all countries
        setSelectedCountry(null);
      } else if (savedPreference) {
        // User has a specific country selected
        setSelectedCountry(savedPreference);
      } else {
        // No preference saved, use detected country
        setSelectedCountry(detected || null);
      }

      setIsLoading(false);
    };

    initializeCountryFilter();
  }, []);

  const handleCountryChange = (country: string | null) => {
    setSelectedCountry(country);
    if (country === null) {
      localStorage.setItem(STORAGE_KEY, 'null');
    } else {
      localStorage.setItem(STORAGE_KEY, country);
    }
  };

  return {
    selectedCountry,
    detectedCountry,
    isLoading,
    handleCountryChange,
  };
};
