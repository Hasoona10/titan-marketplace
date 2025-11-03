'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BrowseListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Mock data for demonstration
  const mockListings = [
    {
      id: '1',
      title: 'MacBook Pro 13" 2020',
      price: 1200,
      category: 'electronics',
      condition: 'Like New',
      sellerName: 'John Doe',
      location: 'CSUF Campus',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Calculus Textbook - Stewart',
      price: 80,
      category: 'textbooks',
      condition: 'Good',
      sellerName: 'Jane Smith',
      location: 'CSUF Campus',
      createdAt: new Date('2024-01-14'),
    },
    {
      id: '3',
      title: 'Office Chair - Ergonomic',
      price: 150,
      category: 'furniture',
      condition: 'Good',
      sellerName: 'Mike Johnson',
      location: 'CSUF Campus',
      createdAt: new Date('2024-01-13'),
    },
    {
      id: '4',
      title: 'iPhone 12 Pro',
      price: 600,
      category: 'electronics',
      condition: 'Good',
      sellerName: 'Sarah Wilson',
      location: 'CSUF Campus',
      createdAt: new Date('2024-01-12'),
    },
    {
      id: '5',
      title: 'Physics Textbook',
      price: 90,
      category: 'textbooks',
      condition: 'Like New',
      sellerName: 'David Brown',
      location: 'CSUF Campus',
      createdAt: new Date('2024-01-11'),
    },
  ];

  return (
    <div className="container">
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            <h1>📋 Browse Listings</h1>
            <p><strong>{mockListings.length} items found</strong></p>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <table width="100%" cellPadding="5" cellSpacing="0">
              <tr>
                <td width="50%">
                  <strong>Search:</strong><br />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="30"
                  />
                </td>
                <td width="50%">
                  <strong>Category:</strong><br />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </table>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <h2>📦 Available Listings:</h2>
            <table width="100%" cellPadding="5" cellSpacing="0">
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Seller</th>
                <th>Date</th>
              </tr>
              {mockListings.map((listing) => (
                <tr key={listing.id} className="listing-item">
                  <td>
                    <Link href={`/sell-item/view-listing/${listing.id}`}>
                      <strong>{listing.title}</strong>
                    </Link>
                  </td>
                  <td><strong>${listing.price}</strong></td>
                  <td>{listing.condition}</td>
                  <td>{listing.sellerName}</td>
                  <td>{listing.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </table>
            
            {mockListings.length === 0 && (
              <p align="center"><em>No listings found</em></p>
            )}
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
