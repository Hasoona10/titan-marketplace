'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Upload, X, Check } from 'lucide-react';
import Image from 'next/image';

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    major: '',
    gradYear: new Date().getFullYear(),
    bio: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majors = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Psychology',
    'Biology',
    'Communications',
    'Education',
    'Art',
    'Music',
    'Other',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gradYear' ? parseInt(value) : value
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      let photoURL = user.photoURL;

      // Upload photo if selected
      if (photoFile) {
        const photoRef = ref(storage, `profiles/${user.id}/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      // Update user document
      await updateDoc(doc(db, 'users', user.id), {
        displayName: formData.displayName,
        major: formData.major,
        gradYear: formData.gradYear,
        bio: formData.bio,
        photoURL: photoURL || undefined,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      // Wait briefly for Firestore to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use full page navigation to ensure auth context refreshes
      window.location.href = '/profile';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600">Please sign in to complete your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-csuf-blue/5 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-csuf-blue mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Tell us a bit about yourself to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-csuf-orange">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Profile preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-csuf-orange text-white rounded-lg hover:bg-csuf-orange/90 transition-colors"
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                name="displayName"
                required
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major *
              </label>
              <select
                name="major"
                required
                value={formData.major}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
              >
                <option value="">Select your major</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Graduation Year *
              </label>
              <input
                type="number"
                name="gradYear"
                required
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                value={formData.gradYear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-csuf-orange text-white py-4 px-6 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete Profile
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

