import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useListingPayment } from '@/hooks/useListingPayment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ListingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [product, setProduct] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { createPayment, mockPayment, LISTING_FEES } = useListingPayment();

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
    if (!product || !sellerId || !user?.id) return;

    setProcessing(true);

    try {
      // Create payment record
      const payment = await createPayment.mutateAsync({
        product_id: product.id,
        seller_id: user.id,
        amount: LISTING_FEES.basic,
        listing_type: 'basic',
      });

      // Mock payment processing
      await mockPayment.mutateAsync(payment.id);

      // Navigate to product detail
      navigate(`/product/${product.id}`, {
        state: { paymentSuccess: true }
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                    <span className="text-sm text-muted-foreground">Listing Type</span>
                    <Badge>Basic</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Listing Fee</span>
                    <span className="font-semibold">{LISTING_FEES.basic} WLD</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{LISTING_FEES.basic} WLD</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">What you get:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 30-day active listing</li>
                  <li>• Up to 5 product images</li>
                  <li>• Chat with potential buyers</li>
                  <li>• Edit listing anytime</li>
                </ul>
              </div>

              <Button 
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={processing}
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
