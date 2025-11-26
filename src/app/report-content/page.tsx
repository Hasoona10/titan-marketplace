'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [reportData, setReportData] = useState({
    type: 'listing',
    targetUserId: '',
    listingId: searchParams.get('listingId') || '',
    messageId: '',
    reason: '',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportTypes = [
    { value: 'listing', label: 'Report Listing' },
    { value: 'user', label: 'Report User' },
    { value: 'message', label: 'Report Message' },
  ];

  const reportReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'scam', label: 'Scam/Fraud' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value,
      // Clear related fields when type changes
      ...(name === 'type' && {
        targetUserId: '',
        listingId: '',
        messageId: '',
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const reportPayload: any = {
        reporterId: user.id,
        reason: reportData.reason,
        details: reportData.details,
        status: 'open',
        createdAt: serverTimestamp(),
      };

      // Add target based on type
      if (reportData.type === 'listing' && reportData.listingId) {
        reportPayload.listingId = reportData.listingId;
      } else if (reportData.type === 'user' && reportData.targetUserId) {
        reportPayload.targetUserId = reportData.targetUserId;
      } else if (reportData.type === 'message' && reportData.messageId) {
        reportPayload.messageId = reportData.messageId;
      } else {
        throw new Error('Please provide the required ID for the report type');
      }

      await addDoc(collection(db, 'reports'), reportPayload);
      
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to submit a report.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-csuf-orange text-white px-6 py-2 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your report. Our moderation team will review it and take appropriate action.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-csuf-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-csuf-blue">Report Content</h1>
                <p className="text-gray-600">Help keep our marketplace safe</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  name="type"
                  required
                  value={reportData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reportData.type === 'listing' ? 'Listing ID' : 
                   reportData.type === 'user' ? 'User ID' : 'Message ID'} *
                </label>
                <input
                  type="text"
                  name={reportData.type === 'listing' ? 'listingId' : 
                        reportData.type === 'user' ? 'targetUserId' : 'messageId'}
                  required
                  value={reportData.type === 'listing' ? reportData.listingId : 
                         reportData.type === 'user' ? reportData.targetUserId : reportData.messageId}
                  onChange={handleInputChange}
                  placeholder={`Enter the ${reportData.type} ID`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <select
                  name="reason"
                  required
                  value={reportData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details *
                </label>
                <textarea
                  name="details"
                  required
                  rows={5}
                  value={reportData.details}
                  onChange={handleInputChange}
                  placeholder="Please provide details about what you're reporting..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Guidelines */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Report Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Only report content that violates our community guidelines</li>
                <li>• False reports may result in account suspension</li>
                <li>• Reports are reviewed by our moderation team</li>
                <li>• You will be notified of the outcome via email</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
