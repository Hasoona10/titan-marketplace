'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-csuf-blue/5 via-transparent to-csuf-orange/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-medium text-csuf-blue uppercase tracking-wider mb-8">
                <Sparkles className="w-3 h-3" />
                <span>CSUF Exclusive</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
                Buy and sell with
                <span className="block font-normal text-csuf-blue mt-2">your campus community</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                A trusted marketplace for students, faculty, and staff. List items, discover deals, and connect with fellow Titans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Link
                      href="/browse-listings"
                      className="inline-flex items-center justify-center gap-2 bg-csuf-blue text-white px-8 py-4 rounded-lg font-medium hover:bg-csuf-blue/90 transition-all shadow-sm hover:shadow-md"
                    >
                      Browse Listings
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/sell-item/create-listing"
                      className="inline-flex items-center justify-center gap-2 bg-white border-2 border-csuf-orange text-csuf-orange px-8 py-4 rounded-lg font-medium hover:bg-csuf-orange/5 transition-all"
                    >
                      List an Item
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-csuf-blue text-white px-8 py-4 rounded-lg font-medium hover:bg-csuf-blue/90 transition-all shadow-sm hover:shadow-md"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-csuf-blue/5 to-csuf-orange/5 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-600 mb-8">
                Join the marketplace and start buying or selling today.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-csuf-blue text-white px-8 py-4 rounded-lg font-medium hover:bg-csuf-blue/90 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
