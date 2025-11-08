import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useUpdatePlatformConfig } from '@/hooks/useUpdatePlatformConfig';

export function ConfigurationPanel() {
  const { data: config, isLoading } = usePlatformConfig();
  const updateConfig = useUpdatePlatformConfig();

  const [currencies, setCurrencies] = useState<string[]>(['WLD']);
  const [listingFees, setListingFees] = useState({ WLD: 0.5, USDC: 1.0 });
  const [supportContact, setSupportContact] = useState({ email: '', phone: '' });

  useEffect(() => {
    if (config) {
      if (config.payment_currencies) {
        setCurrencies(config.payment_currencies.default || ['WLD']);
      }
      if (config.listing_fee) {
        setListingFees(config.listing_fee);
      }
      if (config.support_contact) {
        setSupportContact(config.support_contact);
      }
    }
  }, [config]);

  const handleCurrencyChange = (currency: string, checked: boolean) => {
    const newCurrencies = checked
      ? [...currencies, currency]
      : currencies.filter((c) => c !== currency);
    setCurrencies(newCurrencies);
  };

  const saveCurrencies = () => {
    updateConfig.mutate({
      key: 'payment_currencies',
      value: { available: ['WLD', 'USDC'], default: currencies },
    });
  };

  const saveListingFees = () => {
    updateConfig.mutate({
      key: 'listing_fee',
      value: listingFees,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Currencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wld"
                checked={currencies.includes('WLD')}
                onCheckedChange={(checked) => handleCurrencyChange('WLD', checked as boolean)}
              />
              <Label htmlFor="wld" className="cursor-pointer">World Coin (WLD)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usdc"
                checked={currencies.includes('USDC')}
                onCheckedChange={(checked) => handleCurrencyChange('USDC', checked as boolean)}
              />
              <Label htmlFor="usdc" className="cursor-pointer">USDC</Label>
            </div>
          </div>
          <Button onClick={saveCurrencies} disabled={currencies.length === 0}>
            Save Currencies
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listing Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="wld-fee">WLD Listing Fee</Label>
              <Input
                id="wld-fee"
                type="number"
                step="0.1"
                value={listingFees.WLD}
                onChange={(e) => setListingFees({ ...listingFees, WLD: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="usdc-fee">USDC Listing Fee</Label>
              <Input
                id="usdc-fee"
                type="number"
                step="0.1"
                value={listingFees.USDC}
                onChange={(e) => setListingFees({ ...listingFees, USDC: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={saveListingFees}>Save Listing Fees</Button>
        </CardContent>
      </Card>

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
                onChange={(e) => setSupportContact({ ...supportContact, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="support-phone">Support Phone (Optional)</Label>
              <Input
                id="support-phone"
                type="tel"
                placeholder="+1234567890"
                value={supportContact.phone}
                onChange={(e) => setSupportContact({ ...supportContact, phone: e.target.value })}
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
