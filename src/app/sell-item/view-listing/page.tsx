'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Listing } from '@/types';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockListing: Listing = {
      id: id as string,
      title: 'MacBook Pro 13&quot; 2020',
      description: 'Excellent condition MacBook Pro 13&quot; from 2020. Used for school work, no issues. Comes with original charger and box. Perfect for students who need a reliable laptop for programming and design work.',
      price: 1200,
      category: 'electronics',
      condition: 'like-new',
      images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
      sellerId: 'seller123',
      sellerName: 'John Doe',
      sellerEmail: 'john.doe@csu.fullerton.edu',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isActive: true,
      isHidden: false,
      location: 'CSUF Campus',
    };
    
    setListing(mockListing);
    setLoading(false);
  }, [id]);

  const handleMessageSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    // TODO: Implement actual messaging with Firebase
    console.log('Sending message:', { message, listingId: listing.id, sellerId: listing.sellerId });
    
    setMessage('');
    setShowMessageForm(false);
    alert('Message sent! (This is a demo)');
  };

  const handleReport = () => {
    router.push('/report-content');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <p className="text-gray-600 mb-6">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/browse-listings')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            <h1>📦 {listing.title}</h1>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <table width="100%" cellPadding="10" cellSpacing="0">
              <tr>
                <td width="70%" valign="top">
                  <h2>📝 Description</h2>
                  <p>{listing.description}</p>
                  
                  <h2>👤 Seller Information</h2>
                  <table width="100%" cellPadding="5" cellSpacing="0">
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{listing.sellerName}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{listing.sellerEmail}</td>
                    </tr>
                    <tr>
                      <td><strong>Member Since:</strong></td>
                      <td>{listing.createdAt.toLocaleDateString()}</td>
                    </tr>
                  </table>
                </td>
                
                <td width="30%" valign="top">
                  <table width="100%" cellPadding="5" cellSpacing="0">
                    <tr>
                      <td><strong>Price:</strong></td>
                      <td><strong style={{color: '#cc0000', fontSize: '18px'}}>${listing.price}</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Condition:</strong></td>
                      <td>{listing.condition}</td>
                    </tr>
                    <tr>
                      <td><strong>Category:</strong></td>
                      <td>{listing.category}</td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong></td>
                      <td>{listing.location}</td>
                    </tr>
                  </table>
                  
                  <hr />
                  
                  {user && user.id !== listing.sellerId ? (
                    <div>
                      <h3>💬 Contact Seller</h3>
                      {showMessageForm ? (
                        <form onSubmit={handleMessageSeller}>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message to the seller..."
                            rows={4}
                            cols="30"
                            required
                          />
                          <br /><br />
                          <button type="submit">📤 Send Message</button>
                          <button type="button" onClick={() => setShowMessageForm(false)}>❌ Cancel</button>
                        </form>
                      ) : (
                        <button onClick={() => setShowMessageForm(true)}>💬 Message Seller</button>
                      )}
                    </div>
                  ) : user?.id === listing.sellerId ? (
                    <p><em>This is your listing</em></p>
                  ) : (
                    <div>
                      <p><em>Sign in to message the seller</em></p>
                      <button onClick={() => router.push('/login')}>🔐 Sign In</button>
                    </div>
                  )}

                  {user && (
                    <div>
                      <hr />
                      <button onClick={handleReport}>⚠️ Report Listing</button>
                    </div>
                  )}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td>
            <hr />
            <p align="center">
              <small>© 2024 Titan Marketplace | Page last updated: {new Date().toLocaleDateString()}</small>
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
}
