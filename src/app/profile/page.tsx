'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Check if profile is complete
      if (user.profileComplete === false) {
        router.push('/profile/setup');
        return;
      }
      // Only load listings if profile is complete (true or undefined for backwards compatibility)
      if (user.profileComplete !== false) {
        loadListings();
      }
    }
  }, [user, router]);

  const loadListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First try with both filters (requires composite index)
      let q = query(
        collection(db, 'listings'),
        where('sellerId', '==', user.id),
        where('status', '==', 'active')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (indexError: any) {
        // If index doesn't exist, fall back to filtering by sellerId only
        if (indexError?.code === 'failed-precondition') {
          console.warn('Composite index not found, using fallback query');
          q = query(
            collection(db, 'listings'),
            where('sellerId', '==', user.id)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw indexError;
        }
      }

      const listingsData: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by status in memory if we used fallback query
        if (data.status === 'active') {
          listingsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Listing);
        }
      });

      setUserListings(listingsData);
      setListingsError('');
    } catch (error: any) {
      console.error('Error loading listings:', error);
      // Set empty array on error so page still renders
      setUserListings([]);
      setListingsError(error?.message || 'Failed to load listings. You can still view your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setDeletingId(listingId);
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: 'sold',
        updatedAt: serverTimestamp(),
      });
      setUserListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-csuf-orange text-white px-6 py-2 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-csuf-blue to-csuf-blue/90 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center gap-6">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-csuf-blue text-3xl font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-blue-100 mb-1">{user.email}</p>
                {user.major && (
                  <p className="text-blue-200 text-sm">{user.major} • Class of {user.gradYear}</p>
                )}
                {user.bio && (
                  <p className="text-blue-100 mt-2">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'listings'
                      ? 'text-csuf-orange border-b-2 border-csuf-orange'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Listings
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'text-csuf-orange border-b-2 border-csuf-orange'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                    <Link
                      href="/sell-item/create-listing"
                      className="inline-flex items-center gap-2 bg-csuf-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create New Listing
                    </Link>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-csuf-orange animate-spin" />
                    </div>
                  ) : listingsError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600 mb-4">{listingsError}</p>
                      <button
                        onClick={loadListings}
                        className="text-csuf-blue hover:text-csuf-orange transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  ) : userListings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                      <p className="text-gray-600 mb-6">Start selling by creating your first listing!</p>
                      <Link
                        href="/sell-item/create-listing"
                        className="inline-flex items-center gap-2 bg-csuf-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Create Listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userListings.map((listing) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <Link href={`/sell-item/view-listing/${listing.id}`}>
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
                                  <Plus className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link href={`/sell-item/view-listing/${listing.id}`}>
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {listing.title}
                              </h3>
                            </Link>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xl font-bold text-csuf-orange">
                                ${listing.price}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {listing.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => router.push(`/sell-item/create-listing?edit=${listing.id}`)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-csuf-orange/3 hover:border-csuf-orange/30 hover:text-csuf-orange/70 transition-colors text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                disabled={deletingId === listing.id}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                              >
                                {deletingId === listing.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={user.displayName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                        readOnly
                      />
                    </div>

                    {user.major && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Major
                        </label>
                        <input
                          type="text"
                          value={user.major}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                          readOnly
                        />
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-200">
                      <Link
                        href="/profile/setup"
                        className="inline-flex items-center gap-2 text-csuf-blue hover:text-csuf-orange transition-colors mb-4"
                      >
                        <Settings className="w-5 h-5" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
