export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  major?: string;
  gradYear?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
  profileComplete?: boolean;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  imageUrls: string[];
  status: 'active' | 'sold';
  createdAt: Date;
  updatedAt: Date;
  location?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  listingId: string;
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  readBy: string[];
}

export interface Report {
  id: string;
  reporterId: string;
  targetUserId?: string;
  listingId?: string;
  messageId?: string;
  reason: string;
  details: string;
  status: 'open' | 'review' | 'resolved';
  createdAt: Date;
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

