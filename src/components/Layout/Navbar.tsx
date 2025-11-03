'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td width="200">
            <Link href="/"><strong>🏛️ Titan Marketplace</strong></Link>
          </td>
          <td align="center">
            <Link href="/browse-listings">📋 Browse</Link> | 
            {user ? (
              <>
                <Link href="/sell-item/create-listing"> ➕ Sell</Link> | 
                <Link href="/chat"> 💬 Messages</Link> | 
                <Link href="/profile"> 👤 Profile</Link> | 
                <Link href="/report-content"> ⚠️ Report</Link> | 
                <button onClick={logout}>🚪 Logout</button>
              </>
            ) : (
              <Link href="/login"> 🔐 Login</Link>
            )}
          </td>
          <td width="200" align="right">
            <small>Last updated: {new Date().toLocaleDateString()}</small>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default Navbar;
