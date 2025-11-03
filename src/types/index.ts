export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isHidden: boolean;
  location?: string;
}

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Report {
  id: string;
  type: 'listing' | 'user';
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}

export type ListingCategory = 
  | 'electronics'
  | 'textbooks'
  | 'furniture'
  | 'clothing'
  | 'sports'
  | 'books'
  | 'vehicles'
  | 'other';

