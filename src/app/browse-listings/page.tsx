'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BrowseListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'textbooks', label: 'Textbooks' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

  const loadListings = async () => {
    setLoading(true);
    setError('');
    try {
      let q;
      let querySnapshot;
      
      // Try the full query first (requires composite index)
      try {
        q = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        if (selectedCategory !== 'all') {
          q = query(q, where('category', '==', selectedCategory));
        }

        querySnapshot = await getDocs(q);
      } catch (indexError: any) {
        // If index doesn't exist, use fallback query
        if (indexError?.code === 'failed-precondition' || indexError?.message?.includes('index')) {
          console.warn('Composite index not found, using fallback query');
          
          // Fallback: Get all listings, filter and sort in memory
          q = query(
            collection(db, 'listings'),
            limit(100) // Get more to account for filtering
          );
          
          querySnapshot = await getDocs(q);
        } else {
          throw indexError;
        }
      }

      const listingsData: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listing = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing;
        
        // Filter by status and category in memory if using fallback
        if (listing.status === 'active') {
          if (selectedCategory === 'all' || listing.category === selectedCategory) {
            listingsData.push(listing);
          }
        }
      });

      // Sort by createdAt descending
      listingsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Limit to 50
      setListings(listingsData.slice(0, 50));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load listings';
      setError(errorMessage);
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      listing.title.toLowerCase().includes(searchLower) ||
      listing.description.toLowerCase().includes(searchLower)
    );
  });

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-csuf-blue mb-2">Browse Listings</h1>
          <p className="text-gray-600 mb-8">
            {loading ? 'Loading...' : `${filteredListings.length} items found`}
          </p>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-8">
              <p className="font-semibold mb-2">⚠️ Index Required</p>
              <p className="text-sm mb-2">{error}</p>
              {error.includes('index') && (
                <a
                  href="https://console.firebase.google.com/v1/r/project/titan-marketplace/firestore/indexes?create_composite=ClJwcm9qZWN0cy90aXRhbi1tYXJrZXRwbGFjZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbGlzdGluZ3MvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-csuf-blue hover:text-csuf-orange underline"
                >
                  Click here to create the index (takes ~1 minute)
                </a>
              )}
            </div>
          )}

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to list an item!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing, idx) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/sell-item/view-listing/${listing.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      <div className="relative w-full h-48 bg-gray-100">
                        {listing.imageUrls && listing.imageUrls.length > 0 ? (
                          <Image
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="w-12 h-12" />
                          </div>
                        )}
                        {listing.status === 'sold' && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Sold
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {listing.description}
                        </p>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-csuf-orange">
                              ${listing.price}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {listing.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {listing.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
