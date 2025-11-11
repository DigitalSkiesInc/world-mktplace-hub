import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useUpdatePlatformConfig } from '@/hooks/useUpdatePlatformConfig';

export function ConfigurationPanel() {
  const { data: config, isLoading } = usePlatformConfig();
  const updateConfig = useUpdatePlatformConfig();

  const [currencies, setCurrencies] = useState<Record<string, any>>({});
  const [supportContact, setSupportContact] = useState({ email: '', phone: '' });

  useEffect(() => {
    if (config?.listing_payment_config?.currencies) {
      setCurrencies(config.listing_payment_config.currencies);
    }
    if (config?.support_contact) {
      setSupportContact(config.support_contact);
    }
  }, [config]);

  const handleAvailabilityChange = (symbol: string, checked: boolean) => {
    setCurrencies((prev) => ({
      ...prev,
      [symbol]: { ...prev[symbol], available: checked },
    }));
  };

  const handleFeeChange = (symbol: string, value: string) => {
    setCurrencies((prev) => ({
      ...prev,
      [symbol]: { ...prev[symbol], amount: parseFloat(value) || 0 },
    }));
  };

  const saveCurrencies = () => {
    updateConfig.mutate({
      key: 'listing_payment_config',
      value: { currencies },
    });
  };

  const saveSupportContact = () => {
    updateConfig.mutate({
      key: 'support_contact',
      value: supportContact,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currencyKeys = Object.keys(currencies || {});

  return (
    <div className="space-y-6">
      {/* Payment Currencies Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Currencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currencyKeys.map((symbol) => (
              <div key={symbol} className="flex items-center space-x-2">
                <Checkbox
                  id={symbol}
                  checked={currencies[symbol].available}
                  onCheckedChange={(checked) =>
                    handleAvailabilityChange(symbol, checked as boolean)
                  }
                />
                <Label htmlFor={symbol} className="cursor-pointer">
                  {currencies[symbol].label}
                </Label>
              </div>
            ))}
          </div>
          <Button onClick={saveCurrencies}>Save Currencies</Button>
        </CardContent>
      </Card>

      {/* Listing Fees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currencyKeys.map((symbol) => (
              <div key={`${symbol}-fee`}>
                <Label htmlFor={`${symbol}-fee`}>
                  {currencies[symbol].symbol} Listing Fee
                </Label>
                <Input
                  id={`${symbol}-fee`}
                  type="number"
                  step="0.1"
                  value={currencies[symbol].amount}
                  onChange={(e) => handleFeeChange(symbol, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button onClick={saveCurrencies}>Save Listing Fees</Button>
        </CardContent>
      </Card>

      {/* Support Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Support Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                placeholder="support@example.com"
                value={supportContact.email}
                onChange={(e) =>
                  setSupportContact({ ...supportContact, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="support-phone">Support Phone (Optional)</Label>
              <Input
                id="support-phone"
                type="tel"
                placeholder="+1234567890"
                value={supportContact.phone}
                onChange={(e) =>
                  setSupportContact({ ...supportContact, phone: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={saveSupportContact} disabled={!supportContact.email}>
            Save Support Contact
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
