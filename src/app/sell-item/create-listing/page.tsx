'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'electronics',
    condition: 'good',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'textbooks', label: 'Textbooks' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual listing creation with Firebase
      console.log('Creating listing:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/browse-listings');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to create a listing.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Sign In
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
            <h1>➕ Create New Listing</h1>
            <p><strong>Fill out the form below to post your item for sale</strong></p>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <form onSubmit={handleSubmit}>
              <table width="100%" cellPadding="10" cellSpacing="0">
                <tr>
                  <td width="30%"><strong>Title *</strong></td>
                  <td width="70%">
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="What are you selling?"
                      size="50"
                    />
                  </td>
                </tr>
                
                <tr>
                  <td valign="top"><strong>Description *</strong></td>
                  <td>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      cols="50"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your item in detail..."
                    />
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Price ($) *</strong></td>
                  <td>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      size="10"
                    />
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Category *</strong></td>
                  <td>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Condition *</strong></td>
                  <td>
                    <select
                      name="condition"
                      required
                      value={formData.condition}
                      onChange={handleInputChange}
                    >
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Location (optional)</strong></td>
                  <td>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., CSUF Campus, Fullerton"
                      size="30"
                    />
                  </td>
                </tr>
                
                <tr>
                  <td valign="top"><strong>Images</strong></td>
                  <td>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled
                    />
                    <br />
                    <small><em>Image upload will be implemented with Firebase Storage</em></small>
                  </td>
                </tr>
                
                {error && (
                  <tr>
                    <td colspan="2" style={{color: '#cc0000'}}>
                      <strong>Error: {error}</strong>
                    </td>
                  </tr>
                )}
                
                <tr>
                  <td colspan="2" align="center">
                    <hr />
                    <button type="button" onClick={() => router.back()}>❌ Cancel</button>
                    <button type="submit" disabled={loading}>
                      {loading ? '⏳ Creating...' : '✅ Create Listing'}
                    </button>
                  </td>
                </tr>
              </table>
            </form>
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
