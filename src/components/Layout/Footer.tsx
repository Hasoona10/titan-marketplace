'use client';

import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-csuf-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/csuf-logo.png"
                alt="CSUF Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h3 className="text-xl font-bold">Titan Marketplace</h3>
            </div>
            <p className="text-blue-100">
              CSUF-exclusive buy/sell marketplace for students, faculty, and staff.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse-listings" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/sell-item/create-listing" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  Sell Item
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/report-content" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  Report Issue
                </Link>
              </li>
              <li>
                <a href="https://www.fullerton.edu" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-csuf-orange transition-colors">
                  CSUF Website
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-700 mt-8 pt-8 text-center">
          <p className="text-blue-200">
            © 2024 Titan Marketplace. For CSUF students, faculty, and staff only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
