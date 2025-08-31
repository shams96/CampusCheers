'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { resultsApi, type Cheer } from '@/lib/api';

export default function ResultsPage() {
  const router = useRouter();
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, using a hardcoded test user ID - in real app this would come from auth
  const testUserId = 'cmetfbkev000jiea4juya75nj';

  useEffect(() => {
    loadCheers();
  }, []);

  const loadCheers = async () => {
    try {
      setLoading(true);
      const response = await resultsApi.getCheers(testUserId);
      setCheers(response.data);
    } catch (error) {
      console.error('Error loading cheers:', error);
      alert('Failed to load your cheers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = (cheer: Cheer) => {
    // TODO: Implement hint functionality
    console.log('Getting hint for cheer:', cheer.id);
    alert('Hint functionality coming soon!');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cheers-coral-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading your cheers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-900 text-white p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center">Your Cheers</h1>
        <p className="mt-2 text-md text-neutral-400 text-center">
          Here's the positive feedback from your friends!
        </p>

        {cheers.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-neutral-400">No cheers yet! Complete a Hype Round to see your results.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {cheers.map((cheer) => (
              <div key={cheer.id} className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-neutral-300">{cheer.question}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-cheers-coral-500">{cheer.votes} Cheers</span>
                  <Button size="small" label="Get a Hint" onClick={() => handleGetHint(cheer)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button primary label="Back to Dashboard" onClick={() => router.push('/dashboard')} />
        </div>
      </div>
    </main>
  );
}
