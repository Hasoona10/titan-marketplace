'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, User } from '@/types';
import { motion } from 'framer-motion';
import { MessageSquare, AlertTriangle, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    if (!id || typeof id !== 'string') return;
    
    setLoading(true);
    setError('');
    try {
      const listingDoc = await getDoc(doc(db, 'listings', id));
      
      if (!listingDoc.exists()) {
        setError('Listing not found');
        setLoading(false);
        return;
      }

      const data = listingDoc.data();
      const listingData: Listing = {
        id: listingDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Listing;

      setListing(listingData);

      // Load seller information
      if (listingData.sellerId) {
        const sellerDoc = await getDoc(doc(db, 'users', listingData.sellerId));
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          setSeller({
            id: sellerDoc.id,
            ...sellerData,
            createdAt: sellerData.createdAt?.toDate() || new Date(),
            updatedAt: sellerData.updatedAt?.toDate() || new Date(),
          } as User);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
      console.error('Error loading listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSeller = () => {
    if (!user || !listing) return;
    router.push(`/chat?listingId=${listing.id}&sellerId=${listing.sellerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-csuf-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <p className="text-gray-600 mb-6">{error || "The listing you're looking for doesn't exist or has been removed."}</p>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-6 sm:p-8">
              {/* Images */}
              <div>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    <Image
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-24 h-24" />
                    </div>
                  )}
                  {listing.status === 'sold' && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                      Sold
                    </div>
                  )}
                </div>
                {listing.imageUrls && listing.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.imageUrls.slice(1, 5).map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={url}
                          alt={`${listing.title} ${idx + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <h1 className="text-3xl font-bold text-csuf-blue mb-4">{listing.title}</h1>
                
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl font-bold text-csuf-orange">
                    ${listing.price}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {listing.category}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                    {listing.condition}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {listing.location && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p className="text-gray-900">{listing.location}</p>
                  </div>
                )}

                {/* Seller Info */}
                {seller && (
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Seller</h3>
                    <Link
                      href={`/profile/${seller.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
                    >
                      {seller.photoURL ? (
                        <Image
                          src={seller.photoURL}
                          alt={seller.displayName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-csuf-blue rounded-full flex items-center justify-center text-white font-semibold">
                          {seller.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-csuf-orange transition-colors">
                          {seller.displayName}
                        </p>
                        {seller.major && (
                          <p className="text-sm text-gray-500">{seller.major}</p>
                        )}
                        <p className="text-xs text-csuf-blue mt-1 group-hover:underline">
                          View profile →
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  {user && user.id !== listing.sellerId ? (
                    <>
                      <button
                        onClick={handleMessageSeller}
                        className="w-full bg-csuf-orange text-white py-4 px-6 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Message Seller
                      </button>
                      <Link
                        href={`/report-content?listingId=${listing.id}`}
                        className="w-full border border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Report Listing
                      </Link>
                    </>
                  ) : user?.id === listing.sellerId ? (
                    <p className="text-center text-gray-500 py-4">This is your listing</p>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full bg-csuf-orange text-white py-4 px-6 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors flex items-center justify-center gap-2"
                    >
                      Sign in to message seller
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

