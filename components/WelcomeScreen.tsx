'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/lib/types';

interface WelcomeScreenProps {
  onLogin: (user: User) => void;
}

export default function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const identifier = loginMethod === 'email' ? email : phone;
      
      if (!identifier) {
        throw new Error(`Please enter your ${loginMethod === 'email' ? 'school email' : 'phone number'}`);
      }

      if (loginMethod === 'email' && !identifier.includes('@')) {
        throw new Error('Please enter a valid school email address');
      }

      if (loginMethod === 'phone' && identifier.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      // Mock user creation/login
      const mockUser: User = {
        user_id: `user_${Date.now()}`,
        school_email: loginMethod === 'email' ? identifier : `${identifier}@school.com`,
        created_at: new Date()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLogin(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-viva-magenta via-magenta-light to-pink-400 flex items-center justify-center p-4"
    >
      <div className="card max-w-md w-full">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-viva-magenta to-magenta-light rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <span className="text-white text-3xl">🎉</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 font-satoshi mb-2">
            Campus Cheers
          </h1>
          <p className="text-gray-600 text-lg">
            Spread positivity, one poll at a time
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login method toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-viva-magenta shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📧 School Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-viva-magenta shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📱 Phone Number
            </button>
          </div>

          {/* Input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {loginMethod === 'email' ? 'School Email Address' : 'Phone Number'}
            </label>
            <input
              type={loginMethod === 'email' ? 'email' : 'tel'}
              value={loginMethod === 'email' ? email : phone}
              onChange={(e) => loginMethod === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
              placeholder={loginMethod === 'email' ? 'student@school.edu' : '(555) 123-4567'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viva-magenta focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Get Started'
            )}
          </button>
        </form>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
            Why Campus Cheers?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cheer-green rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700">100% anonymous voting</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cheer-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700">Positive, uplifting questions</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cheer-yellow rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700">Quick 2-minute daily polls</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-viva-magenta rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700">Build a positive school community</span>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => setShowConsent(true)}
              className="text-viva-magenta hover:underline"
            >
              Privacy Policy
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={() => setShowConsent(true)}
              className="text-viva-magenta hover:underline"
            >
              Terms of Service
            </button>
          </p>
        </div>
      </div>

      {/* GDPR Consent Modal */}
      {showConsent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConsent(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Privacy & Data Protection
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>Your privacy matters to us.</strong> Campus Cheers is designed with privacy-first principles:
              </p>
              <ul className="space-y-2">
                <li>• All votes are completely anonymous</li>
                <li>• Selfie videos are automatically deleted after 30 days</li>
                <li>• No personal data is shared with third parties</li>
                <li>• You can request data deletion at any time</li>
                <li>• We use encryption to protect your information</li>
              </ul>
              <p>
                By using Campus Cheers, you consent to our data processing practices as outlined in our Privacy Policy.
              </p>
            </div>
            <button
              onClick={() => setShowConsent(false)}
              className="btn-primary w-full mt-6"
            >
              I Understand
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
} 