'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/Button';
import { resultsApi } from '@/lib/api';
import InstitutionDisplay from '@/components/InstitutionDisplay';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasCheers, setHasCheers] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      checkForCheers();
    }
  }, [status, session, router]);

  // Get user ID from NextAuth session
  const getUserId = () => {
    if (session?.user?.email) {
      // In production, you'd look up the user ID from the database using the email
      // For now, return a placeholder based on email
      return `user_${session.user.email.replace('@', '_').replace('.', '_')}`;
    }
    // Fallback to test user for development
    console.log('Using fallback test user ID');
    return 'cmeuut0550011ie788pn73uir';
  };

  // Get school info - for now, we'll need to fetch this from the database
  // In a real implementation, you'd include school info in the session
  const getSchoolInfo = () => {
    // For now, return a placeholder - in production you'd fetch from DB
    return {
      name: 'Your School',
      city: 'City',
      state: 'State'
    };
  };

  const checkForCheers = async () => {
    try {
      // Get user ID from new auth system or fallback to test user
      const userIdToCheck = getUserId();

      console.log('Checking cheers for user ID:', userIdToCheck);

      const response = await resultsApi.getCheers(userIdToCheck);
      console.log('Cheers response:', response);

      // Handle both array and object responses
      const cheersData = Array.isArray(response.data) ? response.data : [];
      setHasCheers(cheersData.length > 0);
    } catch (error: any) {
      console.error('Error checking cheers:', error);
      console.error('Error details:', error.response?.data || error.message);

      // For network errors or missing users, just show no cheers
      // This is expected for new users or during development
      setHasCheers(false);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cheers-coral-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">
            {status === 'loading' ? 'Checking authentication...' : 'Loading dashboard...'}
          </p>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-900 text-white p-8">
      <div className="w-full max-w-md">
        <InstitutionDisplay className="mb-6" showType={true} />

        {/* Welcome message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-neutral-400">Ready to connect with your school community?</p>
        </div>

        <div className="mt-8 p-6 bg-neutral-800 rounded-lg">
          <h2 className="text-xl font-bold text-cheers-coral-500">🔥 The Hype Round is Live!</h2>
          <p className="mt-2 text-neutral-300">Answer 12 anonymous polls about your friends to unlock and see who cheered for you!</p>
          <div className="mt-4">
            <Button primary size="large" label="Start Hype Round" onClick={() => router.push('/hype-round')} />
          </div>
        </div>

        {hasCheers && (
          <div className="mt-6 p-6 bg-neutral-800 rounded-lg">
            <h2 className="text-xl font-bold text-hype-blue-500">🎉 You Have Cheers!</h2>
            <p className="mt-2 text-neutral-300">Your friends have been voting. Check out what they said!</p>
            <div className="mt-4">
              <Button primary label="View My Cheers" onClick={() => router.push('/results')} />
            </div>
          </div>
        )}

        <div className="mt-6 p-6 bg-neutral-800 rounded-lg">
          <h2 className="text-xl font-bold text-hype-blue-500">⚠️ Cheers Moment</h2>
          <p className="mt-2 text-neutral-300">Capture your daily moment to share with friends!</p>
          <div className="mt-4">
            <Button primary label="Capture Moment" onClick={() => router.push('/moment')} />
          </div>
        </div>

      </div>
    </main>
  );
}
