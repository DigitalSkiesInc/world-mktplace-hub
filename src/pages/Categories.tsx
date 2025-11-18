import React from 'react';
import { Link, useParams,useLocation } from 'react-router-dom';
import { ArrowLeft, Filter, Grid, List, Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useCategories, ProductFilters } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { CountryFilter } from '@/components/CountryFilter';
import { useCountryFilter } from '@/hooks/useCountryFilter';

const Categories: React.FC = () => {
  const { slug } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const [searchQuery, setSearchQuery] = React.useState(searchParam);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedCondition, setSelectedCondition] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const navigate = useNavigate();
  const { selectedCountry, detectedCountry, isLoading: countryLoading, handleCountryChange } = useCountryFilter();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const currentCategory = categories?.find(c => c.slug === slug);

  
  const filters: ProductFilters = {
    categoryId: currentCategory?.id,
    searchQuery: searchQuery || undefined,
    condition: selectedCondition !== 'all' ? selectedCondition : undefined,
    sortBy: sortBy as ProductFilters['sortBy'],
    country: selectedCountry,
  };
  
  const { data: products = [], isLoading: productsLoading } = useProducts(filters,true);

  const conditions = ['all', 'new', 'second-hand'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Best Rated' },
  ];

  const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchQuery(value);
  navigate(`/categories?search=${encodeURIComponent(value)}`);
};

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
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={ handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
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

          {/* Sort */}
          <div className="mb-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Country Filter */}
      {!countryLoading && (
        <CountryFilter
          selectedCountry={selectedCountry}
          detectedCountry={detectedCountry}
          onCountryChange={handleCountryChange}
        />
      )}

      <div className="px-4 py-6">
        {/* Categories Grid (when no specific category selected) */}
        {!slug && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Browse Categories</h2>
            {categoriesLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors shadow-card"
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse items
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {currentCategory ? `${currentCategory.name} Products` : 'All Products'}
              <span className="text-muted-foreground ml-2">({products.length})</span>
            </h2>
            
            {/* <Button variant="ghost" size="sm">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button> */}
          </div>

          {productsLoading ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : 'space-y-4'
            }>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : 'space-y-4'
            }>
              {products.map((product) => (
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