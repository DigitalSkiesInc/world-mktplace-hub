import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getDefaultCountry(allowFallBack: boolean): Promise<string> {
  const LOCAL_STORAGE_KEY = 'default_country_iso';

  // 1️⃣ Check if already stored locally
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) return cached;

  // 2️⃣ Try to fetch from IP-based geolocation
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      if (data && data.country_code) {
        localStorage.setItem(LOCAL_STORAGE_KEY, data.country_code);
        return data.country_code;
      }
    }
  } catch (e) {
    console.warn('IP-based lookup failed', e);
  }

  // 3️⃣ Fallback: infer from browser language

  if (allowFallBack) {
    try {
    
    const nav = navigator.language || (navigator as any).userLanguage || '';
    const parts = nav.split(/[-_]/);
    if (parts.length >= 2 && parts[1].length === 2) {
      const region = parts[1].toUpperCase();
      // localStorage.setItem(LOCAL_STORAGE_KEY, region);
      return region;
    }

    // sometimes navigator.languages array
    const langs = navigator.languages || [];
    for (const l of langs) {
      const p = l.split(/[-_]/);
      if (p.length >= 2 && p[1].length === 2) {
        const region = p[1].toUpperCase();
        // localStorage.setItem(LOCAL_STORAGE_KEY, region);
        return region;
      }
    }
  } catch (e) {
    console.warn('Navigator language lookup failed', e);
  }

  // 4️⃣ Default fallback
  // localStorage.setItem(LOCAL_STORAGE_KEY, fallbackIso);
  return 'KE';
  }
  else{
    return undefined;
  }
  
}
