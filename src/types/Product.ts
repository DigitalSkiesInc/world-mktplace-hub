export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'WLD' | 'USD';
  images: string[];
  category: ProductCategory;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  seller: {
    id: string;
    username: string;
    rating: number;
    isVerified: boolean;
  };
  location: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views: number;
  isFeatured: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  product?: Product;
  lastMessage?: ChatMessage;
  updatedAt: string;
}

export interface ListingFee {
  type: 'basic' | 'featured' | 'premium';
  price: number;
  currency: 'WLD';
  features: string[];
}