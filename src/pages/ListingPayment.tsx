import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useListingPayment } from '@/hooks/useListingPayment';
import { useListingFee } from '@/hooks/useListingFee';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ref } from 'process';
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'

export default function ListingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [product, setProduct] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { initiatePayment, verifyPayment } = useListingPayment();
  const { data: listingFee, isLoading: isFeeLoading } = useListingFee();

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

  const handlePayment = async () => {
    if (!product || !sellerId || !user?.id || !listingFee) return;

    setProcessing(true);

    try {

      // returns id and amount
      const paymentData = await initiatePayment({
        productId: product.id,
        sellerId: sellerId,
        paymentType: listingFee.payment_type
      });

      console.log("Payment Data:", paymentData);


      // Implement payment with wildcoin for now have a delay to simulate payment processing

      // const payload: PayCommandInput = {
      //   reference: paymentData.paymentId,
      //   to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Test address
      //   tokens: [
      //     {
      //       symbol: Tokens.WLD,
      //       token_amount: tokenToDecimals(paymentData.amount, Tokens.WLD).toString(),
      //     },
      //     // {
      //     //   symbol: Tokens.USDC,
      //     //   token_amount: tokenToDecimals(3, Tokens.USDC).toString(),
      //     // },
      //   ],
      //   description: 'Listing Fee Payment',
      // }


      // if (!MiniKit.isInstalled()) {
      //   return
      // }

      // const { finalPayload } = await MiniKit.commandsAsync.pay(payload)
      // await new Promise(resolve => setTimeout(resolve, 2000));

      const finalPayload = { status: "success", reference: paymentData.paymentId, error_code: null }; // replace with actual payment result

      console.log("Final Payload:", finalPayload);

     

      if (finalPayload.status !== "success") {
        throw new Error(`Payment failed. ${finalPayload.error_code || 'Please try again.'}`);
      }

      // Verify payment
      const verifyData = await verifyPayment(finalPayload.reference!);

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

  if (!product || isFeeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listingFee) {
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

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Listing Fee</span>
                    <span className="font-semibold">{listingFee.amount} {listingFee.currency}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{listingFee.amount} {listingFee.currency}</span>
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
                disabled={processing || !listingFee}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Pay with Worldcoin'
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
