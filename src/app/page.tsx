'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export default function Home() {
  const router = useRouter();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-cheers-coral-500 mb-6">
            CampusCheers
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-4">
            Your daily dose of positive vibes from classmates
          </p>
          <p className="text-lg text-neutral-400 mb-8">
            Get anonymous cheers through fun daily polls • Share authentic moments • Build campus community
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              primary
              size="large"
              label="Get Started"
              onClick={() => {
                router.push('/auth/quick-signup');
              }}
            />
            <Button
              size="large"
              label={showHowItWorks ? "Hide How It Works" : "How It Works"}
              onClick={() => setShowHowItWorks(!showHowItWorks)}
            />
          </div>

          {/* Quick Signup Process Indicator */}
          <div className="bg-neutral-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-2">🚀 Quick 4-Step Signup</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Join your school community in under 2 minutes
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</span>
                <span>Location</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</span>
                <span>School</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</span>
                <span>Phone</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">4</span>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        {showHowItWorks && (
          <div className="mt-12 max-w-4xl w-full">
            <h2 className="text-3xl font-bold text-center mb-8 text-cheers-coral-500">
              How CampusCheers Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              {/* Step 1 */}
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-semibold mb-3 text-hype-blue-500">
                  Daily Hype Round
                </h3>
                <p className="text-neutral-300">
                  Get 12 anonymous positive polls from your friends each day.
                  Questions like "Who always makes you laugh?" or "Who inspires you the most?"
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-3 text-hype-blue-500">
                  Vote & Get Cheers
                </h3>
                <p className="text-neutral-300">
                  Vote in polls to hype up your friends. Answer all 12 polls to unlock and see
                  who cheered for you. Completely anonymous!
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-3 text-hype-blue-500">
                  Cheers Moment
                </h3>
                <p className="text-neutral-300">
                  Share spontaneous photos of your day. Get reactions from friends.
                  Authenticity matters - no filters, just real moments!
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-neutral-800 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-cheers-coral-500">
                  Why Anonymous?
                </h3>
                <p className="text-neutral-300">
                  Anonymity removes social pressure and encourages genuine, positive feedback.
                  Focus on celebrating each other's strengths rather than who said what.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-neutral-950 py-8 px-8 text-center">
        <p className="text-neutral-400 text-sm">
          CampusCheers - Building positive campus communities through anonymous appreciation
        </p>
      </footer>
    </main>
  );
}
