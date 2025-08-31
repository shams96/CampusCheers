'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('Logging out...');
    // In a real app, this would clear auth state and redirect to the login page
    router.push('/');
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    // This would trigger a confirmation modal before proceeding
    alert('Account deletion initiated. (Placeholder)');
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-900 text-white p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center">Settings</h1>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Account</h2>
            <div className="mt-4 flex flex-col space-y-3">
              <Button label="Manage Subscription" onClick={() => router.push('/god-mode')} />
              <Button label="Logout" onClick={handleLogout} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
            <div className="mt-4">
              <Button
                label="Delete Account"
                onClick={handleDeleteAccount}
                primary // Using primary style to indicate a warning/danger action
              />
              <p className="mt-2 text-sm text-neutral-500">
                This action is irreversible and will permanently delete all your data.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button label="Back to Dashboard" onClick={() => router.push('/dashboard')} />
        </div>
      </div>
    </main>
  );
}
