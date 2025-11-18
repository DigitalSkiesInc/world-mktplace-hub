import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import { useUploadProductImages } from '@/hooks/useUploadProductImages';
import { Alert, AlertDescription } from '@/components/ui/alert';

const editProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.enum(['WLD', 'USD']),
  category_id: z.string().min(1, 'Category is required'),
  condition: z.enum(['new', 'second-hand']),
  external_link: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type EditProductFormData = z.infer<typeof editProductSchema>;

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const updateProduct = useUpdateProduct();
  const { uploadImages, uploading } = useUploadProductImages();

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  const isLimitedEdit = product?.status === 'active' || product?.status === 'paused';

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const [productRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productRes.error) throw productRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const productData = productRes.data;

      // Check if user owns this product
      if (productData.seller_id !== user?.id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit your own products',
          variant: 'destructive',
        });
        navigate('/my-listings');
        return;
      }

      setProduct(productData);
      setCategories(categoriesRes.data);
      setExistingImages(productData.images || []);

      form.reset({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        currency: productData.currency as 'WLD' | 'USD',
        category_id: productData.category_id,
        condition: productData.condition as 'new' | 'second-hand',
        external_link: (productData as any).external_link ?? '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      navigate('/my-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImageFiles.length + files.length;

    if (totalImages > 5) {
      toast({
        title: 'Too Many Images',
        description: 'Maximum 5 images allowed',
        variant: 'destructive',
      });
      return;
    }

    setNewImageFiles(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditProductFormData) => {
    if (!id) return;

    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadImages(newImageFiles);
      }

      const allImages = [...existingImages, ...newImageUrls];

      // Prepare update data based on product status
      const updateData: any = {
        id,
        description: data.description,
        price: data.price,
        external_link: data.external_link || null,
      };

      // If inactive, allow full edit
      if (!isLimitedEdit) {
        updateData.title = data.title;
        updateData.currency = data.currency;
        updateData.category_id = data.category_id;
        updateData.condition = data.condition;
        updateData.images = allImages;
      }

      await updateProduct.mutateAsync(updateData);
      navigate('/my-listings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/my-listings')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            {isLimitedEdit && (
              <CardDescription>
                This listing is {product.status}. You can only edit the description and price.
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {isLimitedEdit && (
              <Alert className="mb-6">
                <AlertDescription>
                  Only description and price can be edited for active or paused listings.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLimitedEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLimitedEdit}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WLD">WLD</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLimitedEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLimitedEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="second-hand">Second-hand</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="external_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourstore..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            <strong>Warning:</strong> Suspicious or misleading links may result in your listing being banned.
                          </p>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {!isLimitedEdit && (
                  <div className="space-y-4">
                    <FormLabel>Product Images</FormLabel>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative aspect-square">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeExistingImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {newImageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative aspect-square">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {existingImages.length + newImageFiles.length < 5 && (
                        <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProduct.isPending || uploading}
                >
                  {(updateProduct.isPending || uploading) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
