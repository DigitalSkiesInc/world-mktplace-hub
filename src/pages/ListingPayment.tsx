import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useListingPayment } from '@/hooks/useListingPayment';
import { useListingFeePaymentConfig as useListingFeeConfig } from '@/hooks/useListingFeeConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ref } from 'process';
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput, Network } from '@worldcoin/minikit-js'
import { To } from 'react-flags-select';

export default function ListingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [product, setProduct] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDC');
  const { initiatePayment, verifyPayment } = useListingPayment();
  const { data: listingFeeConfig, isLoading: isListingFeeConfigLoading } = useListingFeeConfig();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({
          title: 'Product Not Found',
          description: 'Unable to load product details',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setProduct(data);
    };

    fetchProduct();

    if (user?.id) {
      setSellerId(user.id);
    }
  }, [id, user, navigate]);

  // Initialize selected currency based on available currencies
  useEffect(() => {
    if (listingFeeConfig) {
      if ('USDC' in listingFeeConfig && listingFeeConfig['USDC'].available === true) {
        setSelectedCurrency('USDC');;
      }
      else {
        const firstAvailable = Object.entries(listingFeeConfig).find(([_, value]) => value.available === true);
        if (firstAvailable) {
          setSelectedCurrency(firstAvailable[0]);
        }
      }
    }

  }, [listingFeeConfig]);

  const handlePayment = async () => {
    if (!product || !sellerId || !user?.id || !listingFeeConfig) return;

    setProcessing(true);

    try {
      console.log('pament details', product.id, sellerId, selectedCurrency);
      const paymentData = await initiatePayment({
        productId: product.id,
        sellerId: sellerId,
        paymentType: 'listing_payment_config',
        currency: selectedCurrency
      });

      console.log("Payment Data:", paymentData);

      const payload: PayCommandInput = {
        reference: paymentData.paymentId,
        to: paymentData.wallet,
        tokens: [
          {
            symbol: Tokens[paymentData.currency as keyof typeof Tokens],
            token_amount: tokenToDecimals(paymentData.amount, Tokens[paymentData.currency as keyof typeof Tokens]).toString(),
          },
        ],
        description: 'Listing Fee Payment',
      }


      if (!MiniKit.isInstalled()) {
        return
      }


      const { finalPayload } = await MiniKit.commandsAsync.pay(payload)


      // for testing, payload not set as constant
      // let { finalPayload } = await MiniKit.commandsAsync.pay(payload)



      // await new Promise(resolve => setTimeout(resolve, 2000));
      // const finalPayload = { status: "success", reference: paymentData.paymentId, error_code: null }; // replace with actual payment result


      if (finalPayload.status !== "success") {
        throw new Error(`Payment failed. ${finalPayload.error_code || 'Please try again.'}`);

        // For testing purposes, simulate success even if failed
        // console.log("finalPayload status not success,", finalPayload);
        // finalPayload = { 
        //   status: "success", 
        //   reference: paymentData.paymentId, 
        //   transaction_id: "0xa5b02107433da9e2a450c433560be1db01963a9146c14eed076cbf2c61837d60",
        //   transaction_status: "submitted",
        //   from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //   chain: Network.WorldChain,
        //   timestamp: Date.now().toString(),
        //   version: 1
        // };
      }

      // Verify payment
      const verifyData = await verifyPayment(
        {
          transaction_id: finalPayload.transaction_id,
          reference: finalPayload.reference
        }
      );

      console.log("Verify Data:", verifyData);

      if (verifyData.status !== "success") {
        throw new Error('Payment verification failed. Please contact support.');
      }

      toast({
        title: 'Payment Successful',
        description: 'Payment successful! Your product listing is now active.',
      });

      navigate(`/product/${product.id}`, {
        state: { paymentSuccess: true }
      });

    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment Failed',
        description: (error as Error).message || 'An error occurred during payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!product || isListingFeeConfigLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listingFeeConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Unable to load listing fee. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Listing</CardTitle>
              <CardDescription>Pay the listing fee to activate your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold mt-2">
                      {product.price} {product.currency}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Currency Selector - Only show if multiple currencies available */}
                {listingFeeConfig
                  && Object.entries(listingFeeConfig).filter(([_, value]: any) => value.available).length > 1
                  && (
                    <div className="space-y-3">
                      <Label>Payment Currency</Label>
                      <RadioGroup value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        {Object.entries(listingFeeConfig || {})
                          .map(([symbol, info]) => (
                            <div key={symbol} className="flex items-center space-x-2">
                              <RadioGroupItem value={symbol} id={symbol} />
                              <Label htmlFor={symbol} className="cursor-pointer font-normal">
                                {info.label} - {info.amount} {info.symbol}
                              </Label>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Listing Fee</span>
                    <span className="font-semibold">{listingFeeConfig[selectedCurrency].amount} {selectedCurrency}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{listingFeeConfig[selectedCurrency].amount} {selectedCurrency}</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">What you get:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Your product is listed for as long as you want</li>
                  <li>• Chat with potential buyers</li>
                  <li>• Edit listing anytime</li>
                </ul>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={processing || !listingFeeConfig}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${listingFeeConfig[selectedCurrency].amount} ${selectedCurrency}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your product will be reviewed and activated shortly after payment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
