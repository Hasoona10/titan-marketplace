'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            <h1>🏛️ Titan Marketplace</h1>
            <p><strong>CSUF Student Marketplace - Buy and sell with fellow Titans</strong></p>
            <p><em>Only @csu.fullerton.edu emails allowed</em></p>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            {user ? (
              <div>
                <p><strong>Welcome, {user.displayName || user.email}!</strong></p>
                <table width="100%" cellPadding="5" cellSpacing="0">
                  <tr>
                    <td width="25%"><Link href="/browse-listings">📋 Browse Listings</Link></td>
                    <td width="25%"><Link href="/sell-item/create-listing">➕ Post a Listing</Link></td>
                    <td width="25%"><Link href="/chat">💬 Messages</Link></td>
                    <td width="25%"><Link href="/report-content">⚠️ Report</Link></td>
                  </tr>
                </table>
              </div>
            ) : (
              <div>
                <p><Link href="/login"><strong>🔐 Login with CSUF Email</strong></Link></p>
              </div>
            )}
          </td>
        </tr>
        
        <tr>
          <td>
            <hr />
            <h2>📋 How It Works</h2>
            
            <table width="100%" cellPadding="10" cellSpacing="0">
              <tr>
                <td width="50%" valign="top">
                  <h3>👨‍💼 For Sellers:</h3>
                  <ul>
                    <li>Login with @csu.fullerton.edu email</li>
                    <li>Fill out item listing form</li>
                    <li>Upload images (Firebase Storage)</li>
                    <li>Save listing info (Firestore)</li>
                    <li>Chat with interested buyers</li>
                  </ul>
                </td>
                <td width="50%" valign="top">
                  <h3>🛒 For Buyers:</h3>
                  <ul>
                    <li>Login with @csu.fullerton.edu email</li>
                    <li>Browse marketplace feed</li>
                    <li>Click on listings to view details</li>
                    <li>Start chat with seller</li>
                    <li>Report inappropriate content</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td>
            <hr />
            <h2>📊 Quick Stats</h2>
            <table width="100%" cellPadding="5" cellSpacing="0">
              <tr>
                <td width="33%" align="center"><strong>40,000+</strong><br />CSUF Students</td>
                <td width="33%" align="center"><strong>Verified</strong><br />@csu.fullerton.edu Only</td>
                <td width="33%" align="center"><strong>Safe</strong><br />Campus Community</td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td>
            <hr />
            <p align="center">
              <small>© 2024 Titan Marketplace | Built with Next.js | Last updated: {new Date().toLocaleDateString()}</small>
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
}
