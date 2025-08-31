'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { hypeApi, type Poll } from '@/lib/api';

function HypeRoundContent() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hypeRoundId, setHypeRoundId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // For now, using a hardcoded test user ID - in real app this would come from auth
  const testUserId = 'cmeuut0550011ie788pn73uir';

  useEffect(() => {
    loadHypeRound();
  }, []);

  const loadHypeRound = async () => {
    try {
      setLoading(true);
      setError(null);

      // First create a hype round
      const roundResponse = await hypeApi.createHypeRound(testUserId);
      setHypeRoundId(roundResponse.data.id);

      // Then get the polls
      const pollsResponse = await hypeApi.getHypeRound(testUserId);
      setPolls(pollsResponse.data);
    } catch (error) {
      console.error('Error loading hype round:', error);
      setError('Failed to load your Hype Round. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (recipientId: string) => {
    if (!polls[currentPollIndex] || voting) return;

    try {
      setVoting(true);
      const currentPoll = polls[currentPollIndex];

      await hypeApi.submitVote({
        voterId: testUserId,
        recipientId,
        pollQuestionId: currentPoll.question.id,
        hypeRoundId,
      });

      if (currentPollIndex < polls.length - 1) {
        setCurrentPollIndex(currentPollIndex + 1);
      } else {
        // Hype round complete
        alert('Hype Round complete! Check your results.');
        router.push('/results');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit your vote. Please try again.');
      // Reset voting state after a short delay to allow retry
      setTimeout(() => setVoting(false), 1000);
    } finally {
      if (!error) {
        setVoting(false);
      }
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cheers-coral-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading your Hype Round...</p>
        </div>
      </main>
    );
  }

  if (polls.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <p className="text-neutral-400">No polls available. Make sure you have friends added!</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-cheers-coral-500 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const currentPoll = polls[currentPollIndex];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-sm text-neutral-400">
          Poll {currentPollIndex + 1} of {polls.length}
        </div>
        <h1 className="text-2xl font-semibold text-white">{currentPoll.question.text}</h1>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {currentPoll.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={voting}
              className="min-h-[120px] p-4 bg-neutral-800 rounded-lg text-lg font-medium text-white hover:bg-hype-blue-500 active:bg-hype-blue-600 transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-hype-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              {voting ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                  <span className="text-sm">Voting...</span>
                </div>
              ) : (
                <>
                  <img
                    src={option.profileImage || '/default-avatar.png'}
                    alt={option.name}
                    className="w-16 h-16 rounded-full mb-2 object-cover"
                  />
                  {option.name}
                </>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-center mb-3">{error}</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setRetryCount(prev => prev + 1);
                  loadHypeRound();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HypeRoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HypeRoundContent />
    </Suspense>
  );
}
