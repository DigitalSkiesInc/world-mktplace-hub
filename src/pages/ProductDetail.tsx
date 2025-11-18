import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, MapPin, Star, Shield, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCreateConversation } from '@/hooks/useCreateConversation';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useIsFavorited } from '@/hooks/useIsFavorited';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ContactSellerDialog } from '@/components/ContactSellerDialog';
import { toast } from '@/hooks/use-toast';
import { SafetyNotice } from '@/components/SafetyNotice';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const { data: product, isLoading, error } = useProduct(id!);
  const { data: isFavorited = false } = useIsFavorited(id!);
  const toggleFavorite = useToggleFavorite();
  const createConversation = useCreateConversation();
  const [showPhoneDialog, setShowPhoneDialog] = React.useState(false);

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save favorites',
      });
      navigate('/profile');
      return;
    }
    toggleFavorite.mutate({ productId: id!, isFavorited });
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to contact the seller',
      });
      navigate('/profile');
      return;
    }

    if (!product) return;

    // Don't allow contacting yourself
    if (product.seller.id === user.id) {
      toast({
        title: 'Cannot message yourself',
        description: 'This is your own listing',
      });
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        productId: product.id,
        sellerId: product.seller.id,
      });

      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link to="/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link to="/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Product Not Found</h1>
          </div>
        </div>
        <div className="p-4 text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Product not found</h3>
          <p className="text-muted-foreground">This product may have been sold or removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Product Details</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className="h-8 w-8 p-0"
            >
              <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Product Images Carousel */}
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isFeatured && (
              <Badge className="bg-gradient-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            {product.condition === 'new' && (
              <Badge variant="secondary">New</Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{product.title}</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-primary">{product.price}</span>
              <span className="text-lg font-medium text-primary">{product.currency}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} />
              <span>{product.location}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* External Link */}
          {product.externalLink && (
            <div className="px-4 py-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Other links to this product
              </h3>
              <a
                href={product.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <ExternalLink size={16} />
                {product.externalLink.length > 25 ? product.externalLink.slice(0, 25) + "…" : product.externalLink}
              </a>
              {/* <p className="text-xs text-muted-foreground mt-1">
                Check this seller's listing on other platforms
              </p> */}
            </div>
          )}

          {/* Seller Info */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Seller Information</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${product.seller.username}`} />
                <AvatarFallback>{product.seller.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{product.seller.username}</span>
                  {product.seller.isVerified && (
                    <Shield size={16} className="text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.seller.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.seller.isVerified ? 'Verified Seller' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium capitalize">{product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{product.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listed</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
        {/* CTA Buttons */}
          <div className="px-4 py-2">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleContactSeller}
                disabled={createConversation.isPending}
              >
                <MessageCircle size={18} className="mr-2" />
                {product.seller.phone ? 'Message' : 'Message Seller'}
              </Button>
              {product.seller.phone && product.seller.allowPhoneContact && (
                <Button
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  onClick={() => setShowPhoneDialog(true)}
                >
                  <Phone size={18} className="mr-2" />
                  Contact Seller
                </Button>
              )}
            </div>
          </div>

        {/* Safety Notice below buttons */}
        <div className="px-4 pb-3 pt-0">
          <SafetyNotice />
        </div>
      </div>

      {/* Contact Seller Phone Dialog */}
      {product.seller.phone && (
        <ContactSellerDialog
          open={showPhoneDialog}
          onOpenChange={setShowPhoneDialog}
          sellerName={product.seller.username}
          phoneNumber={product.seller.phone}
        />
      )}
    </div>
  );
};

export default ProductDetail;