import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info } from 'lucide-react';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useUpdatePlatformConfig } from '@/hooks/useUpdatePlatformConfig';
import { toast } from '@/hooks/use-toast';

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

  const handleWalletChange = (symbol: string, value: string) => {
    setCurrencies((prev) => ({
      ...prev,
      [symbol]: { ...prev[symbol], wallet: value },
    }));
  };

  const saveCurrencies = () => {
    // Validate wallet addresses for available currencies
    const errors: string[] = [];
    
    Object.entries(currencies).forEach(([symbol, config]: [string, any]) => {
      if (config.available) {
        // Check if wallet is set
        if (!config.wallet || config.wallet.trim() === '') {
          errors.push(`${config.label}: Wallet address is required`);
        }
        // Check if wallet format is valid (basic Ethereum address check)
        else if (!/^0x[a-fA-F0-9]{40}$/.test(config.wallet)) {
          errors.push(`${config.label}: Invalid wallet address format`);
        }
        
        // Check if amount is valid
        if (!config.amount || config.amount <= 0) {
          errors.push(`${config.label}: Listing fee must be greater than 0`);
        }
      }
    });
    
    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: (
          <div className="space-y-1">
            {errors.map((error, idx) => (
              <p key={idx} className="text-sm">• {error}</p>
            ))}
          </div>
        ),
        variant: 'destructive',
      });
      return;
    }
    
    // Save if validation passes
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
      {/* Unified Payment Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Configuration</CardTitle>
          <CardDescription>
            Configure listing fees, wallet addresses, and currency availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert about Whitelisting */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Wallet Address Whitelisting Required</AlertTitle>
            <AlertDescription className="text-blue-800 text-sm">
              If you update wallet addresses, you must whitelist the new addresses in your{' '}
              <a 
                href="https://developer.worldcoin.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium hover:text-blue-900"
              >
                Worldcoin Developer Portal
              </a>{' '}
              before they can receive payments.
            </AlertDescription>
          </Alert>

          {/* Currency Configuration List */}
          <div className="space-y-6">
            {currencyKeys.map((symbol) => (
              <Card key={symbol} className="border-2">
                <CardContent className="p-4">
                  {/* Currency Header with Checkbox */}
                  <div className="flex items-center space-x-3 mb-4 pb-3 border-b">
                    <Checkbox
                      id={`available-${symbol}`}
                      checked={currencies[symbol].available}
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange(symbol, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`available-${symbol}`} 
                      className="cursor-pointer font-semibold text-lg flex-1"
                    >
                      {currencies[symbol].label}
                    </Label>
                    <Badge variant={currencies[symbol].available ? "default" : "secondary"}>
                      {currencies[symbol].available ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Currency Details - Only show if available */}
                  {currencies[symbol].available && (
                    <div className="space-y-4 pl-8">
                      {/* Listing Fee Input */}
                      <div className="grid gap-2">
                        <Label htmlFor={`fee-${symbol}`} className="text-sm font-medium">
                          Listing Fee Amount
                        </Label>
                        <Input
                          id={`fee-${symbol}`}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          value={currencies[symbol].amount}
                          onChange={(e) => handleFeeChange(symbol, e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount in {currencies[symbol].symbol}
                        </p>
                      </div>

                      {/* Wallet Address Input */}
                      <div className="grid gap-2">
                        <Label htmlFor={`wallet-${symbol}`} className="text-sm font-medium">
                          Receiving Wallet Address
                        </Label>
                        <Input
                          id={`wallet-${symbol}`}
                          type="text"
                          placeholder="0x..."
                          value={currencies[symbol].wallet || ''}
                          onChange={(e) => handleWalletChange(symbol, e.target.value)}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Ethereum wallet address where {currencies[symbol].symbol} payments will be received
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <Button onClick={saveCurrencies} size="lg" className="w-full">
            Save Payment Configuration
          </Button>
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
