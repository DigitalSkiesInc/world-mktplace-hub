import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, TrendingUp, Eye } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import heroImage from '@/assets/marketplace-hero.jpg';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts = [], isLoading: featuredLoading } = useProducts({ 
    sortBy: 'newest' 
  });
  const { data: recentProducts = [], isLoading: recentLoading } = useProducts({ 
    sortBy: 'newest' 
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-marketplace overflow-hidden">
        <div className="relative px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              World Marketplace
            </h1>
            <p className="text-muted-foreground mb-6">
              Buy and sell with verified World ID users
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </form>

            {/* Quick Actions */}
            <div className="flex gap-3 justify-center">
              <Link to="">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  <Plus size={16} className="mr-2" />
                  Sell Item
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={heroImage}
            alt="World Marketplace"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      </section>

      <div className="px-4 py-6 space-y-8">
        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Categories</h2>
            <Link to="/categories">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {categories?.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="flex flex-col items-center p-3 rounded-lg bg-card hover:bg-muted transition-colors"
                >
                  <span className="text-2xl mb-2">{category.icon}</span>
                  <span className="text-xs text-center font-medium text-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={20} />
            <h2 className="text-xl font-semibold text-foreground">Featured Items</h2>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : featuredProducts.filter(p => p.isFeatured).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.filter(p => p.isFeatured).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </section>

        {/* Recent Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Listings</h2>
            <Link to="/categories">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center py-8 bg-gradient-card rounded-xl">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Join World Marketplace
          </h3>
          <p className="text-muted-foreground mb-4">
            Verify with World ID to start buying and selling
          </p>
          <Link to="/profile">
            <Button className="bg-gradient-primary">
              Get Verified
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;