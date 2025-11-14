export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'WLD' | 'USD';
  images: string[];
  category: ProductCategory;
  condition: 'new' | 'second-hand';
  seller: {
    id: string;
    username: string;
    rating: number;
    isVerified: boolean;
    phone?: string | null;
    allowPhoneContact?: boolean;
  };
  location: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views: number;
  isFeatured: boolean;
  externalLink?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId?: string;
}

export interface DbProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'WLD' | 'USD';
  images: string[];
  category_id: string;
  condition: 'new' | 'second-hand';
  seller_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views: number;
  is_featured: boolean;
  external_link?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbSeller {
  id: string;
  username: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  sellerUserId:string;
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