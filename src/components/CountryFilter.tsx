import React from 'react';
import { Globe, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES } from '@/lib/locationUtils';

interface CountryFilterProps {
  selectedCountry: string | null;
  detectedCountry: string | null;
  onCountryChange: (country: string | null) => void;
}

export const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountry,
  detectedCountry,
  onCountryChange,
}) => {
  const getCountryName = (code: string | null) => {
    if (!code) return null;
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  const isFiltering = selectedCountry !== null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-y border-border">
      <Globe size={16} className="text-muted-foreground" />
      
      {isFiltering ? (
        <>
          <span className="text-sm text-muted-foreground">Showing:</span>
          <Select value={selectedCountry || ''} onValueChange={(value) => onCountryChange(value || null)}>
            <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm">
              <SelectValue>
                <Badge variant="secondary" className="font-normal">
                  {getCountryName(selectedCountry)}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCountryChange(null)}
            className="h-8 px-2"
          >
            <X size={14} className="mr-1" />
            <span className="text-xs">Show All</span>
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">
            Showing products from all countries
          </span>
          {detectedCountry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCountryChange(detectedCountry)}
              className="h-8 px-2"
            >
              <span className="text-xs">Filter by {getCountryName(detectedCountry)}</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
};
