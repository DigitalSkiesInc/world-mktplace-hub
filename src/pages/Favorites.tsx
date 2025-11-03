import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { Product } from '@/types/Product';

export default function Favorites() {
  const { data: favorites = [], isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const handleRemoveFavorite = (productId: string) => {
    toggleFavorite.mutate({ productId, isFavorited: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  console.log('fetched favorites', favorites);

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Favorites</h1>
        </div>
      </div>

      <div className="p-4">
        {favorites.length === undefined || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No favorites yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start exploring and save your favorite products to see them here
            </p>
            <Link to="/">
              <Button className="bg-gradient-primary">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((product) => {
              console.log('rendering favorite', product);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onFavoriteChange={() => handleRemoveFavorite(product.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
