import { Product, ProductCategory, ListingFee } from '@/types/Product';

export const categories: ProductCategory[] = [
  { id: '1', name: 'Phones & Tablets', slug: 'phone-tablets', icon: '📱' },
  { id: '2', name: 'Electronics', slug: 'electronics', icon: '🖥️' },
  { id: '3', name: 'Fashion', slug: 'fashion', icon: '👕' },
  { id: '4', name: 'Home & Furniture', slug: 'home-furniture', icon: '🏠' },
  { id: '5', name: 'Animals & Pets', slug: 'animal-pets', icon: '🐱' },
  { id: '6', name: 'Health & Beauty', slug: 'health-beauty', icon: '💄' },
  { id: '7', name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: '8', name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { id: '9', name: 'Books & Media', slug: 'books-media', icon: '📚' },
  { id: '10', name: 'Toys & Games', slug: 'toys-games', icon: '🎮' },
  { id: '11', name: 'Art & Collectibles', slug: 'art-collectibles', icon: '🎨' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max - Space Black',
    description: 'Brand new iPhone 15 Pro Max, 256GB, Space Black. Never used, still in original packaging with all accessories.',
    price: 850,
    currency: 'WLD',
    images: ['/product-phone.jpg'],
    category: categories[0],
    condition: 'new',
    seller: {
      id: 'seller1',
      username: 'TechDealer',
      rating: 4.9,
      isVerified: true
    },
    location: 'San Francisco, CA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    views: 124,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Vintage Canon AE-1 Camera',
    description: 'Beautiful vintage Canon AE-1 35mm film camera in excellent working condition. Perfect for film photography enthusiasts.',
    price: 200,
    currency: 'WLD',
    images: ['/product-camera.jpg'],
    category: categories[1],
    condition: 'second-hand',
    seller: {
      id: 'seller2',
      username: 'VintageCollector',
      rating: 4.7,
      isVerified: true
    },
    location: 'New York, NY',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    views: 89,
    isFeatured: false
  },
  {
    id: '3',
    title: 'Nike Air Jordan 1 Retro High',
    description: 'Classic Air Jordan 1 in Chicago colorway. Size 10.5, worn a few times but in great condition. No box included.',
    price: 180,
    currency: 'WLD',
    images: ['/product-sneakers.jpg'],
    category: categories[2],
    condition: 'second-hand',
    seller: {
      id: 'seller3',
      username: 'SneakerHead',
      rating: 4.8,
      isVerified: true
    },
    location: 'Los Angeles, CA',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'active',
    views: 67,
    isFeatured: true
  }
];

export const listingFees: ListingFee[] = [
  {
    type: 'basic',
    price: 0.5,
    currency: 'WLD',
    features: ['Standard visibility', '7 days listing', 'Up to 5 photos']
  },
  {
    type: 'featured',
    price: 2.0,
    currency: 'WLD',
    features: ['Enhanced visibility', '14 days listing', 'Up to 10 photos', 'Featured badge']
  },
  {
    type: 'premium',
    price: 5.0,
    currency: 'WLD',
    features: ['Maximum visibility', '30 days listing', 'Unlimited photos', 'Premium badge', 'Priority support']
  }
];