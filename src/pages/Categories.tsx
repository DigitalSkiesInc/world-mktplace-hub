import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Grid, List } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categories, mockProducts } from '@/data/mockData';

const Categories: React.FC = () => {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedCondition, setSelectedCondition] = React.useState<string>('all');

  const currentCategory = categories.find(c => c.slug === slug);
  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = !slug || product.category.slug === slug;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    
    return matchesCategory && matchesSearch && matchesCondition;
  });

  const conditions = ['all', 'new', 'like-new', 'good', 'fair', 'poor'];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link to={slug ? '/categories' : '/'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                {currentCategory ? `${currentCategory.icon} ${currentCategory.name}` : 'All Categories'}
              </h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 w-7 p-0"
              >
                <Grid size={14} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 w-7 p-0"
              >
                <List size={14} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Search in this category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {conditions.map((condition) => (
              <Badge
                key={condition}
                variant={selectedCondition === condition ? 'default' : 'secondary'}
                className="cursor-pointer whitespace-nowrap capitalize"
                onClick={() => setSelectedCondition(condition)}
              >
                {condition === 'all' ? 'All Conditions' : condition}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Categories Grid (when no specific category selected) */}
        {!slug && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Browse Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors shadow-card"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mockProducts.filter(p => p.category.id === category.id).length} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {currentCategory ? `${currentCategory.name} Products` : 'All Products'}
              <span className="text-muted-foreground ml-2">({filteredProducts.length})</span>
            </h2>
            
            <Button variant="ghost" size="sm">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className={viewMode === 'list' ? 'w-full' : ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Categories;