'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');

  // Mock data for demonstration
  useEffect(() => {
    const mockListings: Listing[] = [
      {
        id: '1',
        title: 'MacBook Pro 13" 2020',
        description: 'Excellent condition MacBook Pro...',
        price: 1200,
        category: 'electronics',
        condition: 'like-new',
        images: ['/api/placeholder/300/200'],
        sellerId: user?.id || 'current-user',
        sellerName: user?.displayName || 'Current User',
        sellerEmail: user?.email || 'user@csu.fullerton.edu',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isActive: true,
        isHidden: false,
      },
      {
        id: '2',
        title: 'Calculus Textbook - Stewart',
        description: 'Used calculus textbook...',
        price: 80,
        category: 'textbooks',
        condition: 'good',
        images: ['/api/placeholder/300/200'],
        sellerId: user?.id || 'current-user',
        sellerName: user?.displayName || 'Current User',
        sellerEmail: user?.email || 'user@csu.fullerton.edu',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        isActive: true,
        isHidden: false,
      },
    ];

    setUserListings(mockListings);
    setLoading(false);
  }, [user]);

  const handleEditListing = (listingId: string) => {
    // TODO: Implement edit listing functionality
    console.log('Edit listing:', listingId);
  };

  const handleDeleteListing = (listingId: string) => {
    // TODO: Implement delete listing functionality
    if (confirm('Are you sure you want to delete this listing?')) {
      console.log('Delete listing:', listingId);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.displayName || 'User'}</h1>
              <p className="text-blue-100">{user.email}</p>
              <p className="text-sm text-blue-200">
                Member since {user.createdAt?.toLocaleDateString() || 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                <h2 className="text-xl font-semibold">My Listings</h2>
                <button
                  onClick={() => router.push('/sell-item/create-listing')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Create New Listing
                </button>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-500 mb-6">Start selling by creating your first listing!</p>
                  <button
                    onClick={() => router.push('/sell-item/create-listing')}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                  >
                    Create Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <img
                        src={listing.images[0] || '/api/placeholder/100/100'}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-500">${listing.price} • {listing.category}</p>
                        <p className="text-xs text-gray-400">
                          Created {listing.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditListing(listing.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user.displayName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
