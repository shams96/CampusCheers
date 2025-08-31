'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

const features = [
  'Unlimited hints on who cheered for you',
  'Get notified when friends join',
  'Unlock mutual "Crush Alerts"',
  'Reveal the full sender twice a week',
];

export default function GodModePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-900 text-white p-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-hype-blue-400 to-cheers-coral-400">
            Unlock God Mode
          </h1>
          <p className="mt-2 text-lg text-neutral-300">
            Satisfy your curiosity without compromising the positive vibes.
          </p>
        </div>

        <div className="mt-8 p-6 bg-neutral-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white">Subscription Benefits:</h2>
          <ul className="mt-4 space-y-3 list-disc list-inside text-neutral-300">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <div className="p-6 bg-neutral-800 rounded-lg border border-cheers-coral-500">
            <p className="text-2xl font-bold text-white">$2.99 / month</p>
            <p className="text-neutral-400">Discount available for annual plan.</p>
            <div className="mt-4">
              <Button
                primary
                size="large"
                label="Subscribe Now"
                onClick={() => console.log('Subscribing to God Mode...')}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button label="Back to Dashboard" onClick={() => router.push('/dashboard')} />
        </div>
      </div>
    </main>
  );
}
