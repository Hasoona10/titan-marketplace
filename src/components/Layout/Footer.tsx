import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/csuf-logo.png"
                alt="CSUF Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <h3 className="text-lg font-semibold">Titan Marketplace</h3>
            </div>
            <p className="text-gray-300">
              CSUF-exclusive buy/sell marketplace for students, faculty, and staff.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-gray-300 hover:text-white">Browse Listings</Link></li>
              <li><Link href="/listings/new" className="text-gray-300 hover:text-white">Sell Item</Link></li>
              <li><Link href="/messages" className="text-gray-300 hover:text-white">Messages</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="/report" className="text-gray-300 hover:text-white">Report Issue</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Titan Marketplace. For CSUF students, faculty, and staff only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
