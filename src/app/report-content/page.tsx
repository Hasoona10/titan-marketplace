'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [reportData, setReportData] = useState({
    type: 'item',
    itemId: '',
    reason: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportTypes = [
    { value: 'item', label: 'Report Item/Listing' },
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
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual report submission with Firebase
      console.log('Submitting report:', reportData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
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
          <p className="text-gray-600 mb-6">You need to be signed in to submit a report.</p>
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted</h1>
          <p className="text-gray-600 mb-6">Thank you for your report. Our admin team will review it.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Back to Home
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
            <h1>⚠️ Report Content</h1>
            <p><strong>Help keep our marketplace safe by reporting inappropriate content</strong></p>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <form onSubmit={handleSubmit}>
              <table width="100%" cellPadding="10" cellSpacing="0">
                <tr>
                  <td width="30%"><strong>Report Type *</strong></td>
                  <td width="70%">
                    <select
                      name="type"
                      required
                      value={reportData.type}
                      onChange={handleInputChange}
                    >
                      {reportTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Item/User ID (optional)</strong></td>
                  <td>
                    <input
                      type="text"
                      name="itemId"
                      value={reportData.itemId}
                      onChange={handleInputChange}
                      placeholder="ID of the item, user, or message being reported"
                      size="40"
                    />
                  </td>
                </tr>
                
                <tr>
                  <td><strong>Reason *</strong></td>
                  <td>
                    <select
                      name="reason"
                      required
                      value={reportData.reason}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a reason</option>
                      {reportReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
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
                      value={reportData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide details about what you're reporting..."
                    />
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
                      {loading ? '⏳ Submitting...' : '✅ Submit Report'}
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
            <h2>📋 Report Guidelines</h2>
            <ul>
              <li>Only report content that violates our community guidelines</li>
              <li>False reports may result in account suspension</li>
              <li>Reports are reviewed by our moderation team</li>
              <li>You will be notified of the outcome via email</li>
            </ul>
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
