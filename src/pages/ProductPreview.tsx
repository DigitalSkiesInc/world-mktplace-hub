import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ProductPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError || !productData) {
        toast({
          title: 'Product Not Found',
          description: 'Unable to load product details',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', productData.category_id)
        .single();

      setProduct(productData);
      setCategory(categoryData);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/list-product')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Preview Your Listing</CardTitle>
            <CardDescription>
              Review your product details before proceeding to payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            {product.images && product.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.title} - ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Title</h3>
                <p className="text-lg font-semibold">{product.title}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Description</h3>
                <p className="text-base">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Price</h3>
                  <p className="text-xl font-bold">
                    {product.price} {product.currency}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Condition</h3>
                  <Badge variant="secondary" className="capitalize">
                    {product.condition}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Category</h3>
                  <p className="text-base">{category?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/list-product?edit=${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate(`/list-product/${id}/payment`)}
              >
                Continue to Payment
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your product will remain inactive until payment is completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
