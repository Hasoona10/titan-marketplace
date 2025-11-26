'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, User } from '@/types';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string>('');

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId || typeof userId !== 'string') return;

    setLoading(true);
    setListingsError('');

    try {
      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setListingsError('User not found');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      setProfileUser({
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      } as User);

      // Load user listings
      await loadListings(userId);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setListingsError(error?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async (sellerId: string) => {
    setLoading(true);
    try {
      // First try with both filters (requires composite index)
      let q = query(
        collection(db, 'listings'),
        where('sellerId', '==', sellerId),
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
            where('sellerId', '==', sellerId)
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
      setUserListings([]);
      setListingsError(error?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to own profile if viewing own profile
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      router.push('/profile');
    }
  }, [currentUser, userId, router]);

  if (loading && !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-csuf-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (listingsError && !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <p className="text-gray-600 mb-6">{listingsError}</p>
          <Link
            href="/browse-listings"
            className="inline-flex items-center gap-2 bg-csuf-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/browse-listings"
            className="inline-flex items-center gap-2 text-csuf-blue hover:text-csuf-orange mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to listings
          </Link>

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-csuf-blue to-csuf-blue/90 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center gap-6">
              {profileUser.photoURL ? (
                <Image
                  src={profileUser.photoURL}
                  alt={profileUser.displayName}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-csuf-blue text-3xl font-bold">
                  {profileUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{profileUser.displayName}</h1>
                <p className="text-blue-100 mb-1">{profileUser.email}</p>
                {profileUser.major && (
                  <p className="text-blue-200 text-sm">{profileUser.major} • Class of {profileUser.gradYear}</p>
                )}
                {profileUser.bio && (
                  <p className="text-blue-100 mt-2">{profileUser.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Listings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {profileUser.displayName}'s Listings
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-csuf-orange animate-spin" />
                </div>
              ) : listingsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{listingsError}</p>
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-600">This user hasn't posted any listings.</p>
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
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
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
                        <div className="text-xs text-gray-400">
                          {listing.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

