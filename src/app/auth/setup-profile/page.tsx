'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

export default function SetupProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastInitial, setLastInitial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get data from previous steps
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    // Load data from session storage
    const schoolData = sessionStorage.getItem('selectedSchool');
    const phoneData = sessionStorage.getItem('phoneNumber');
    const gradeData = sessionStorage.getItem('selectedGrade');
    const phoneVerified = sessionStorage.getItem('phoneVerified');

    if (!schoolData || !phoneData || !gradeData || phoneVerified !== 'true') {
      // Redirect back to start if missing required data
      router.push('/auth/zip-code');
      return;
    }

    setSelectedSchool(JSON.parse(schoolData));
    setPhoneNumber(phoneData);
    setSelectedGrade(parseInt(gradeData));
  }, [router]);

  const calculateGradYear = (grade: number): number => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // If it's after June, assume next school year
    if (currentMonth >= 6) {
      return currentYear + (12 - grade) + 1;
    } else {
      return currentYear + (12 - grade);
    }
  };

  const handleProfileSetup = async () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const name = `${firstName.trim()} ${lastInitial.trim()}.`;
      const gradYear = selectedGrade ? calculateGradYear(selectedGrade) : null;

      // Create user profile with all collected data
      const response = await axios.post('/api/auth/setup-profile', {
        phoneNumber,
        name,
        schoolId: selectedSchool?.id,
        grade: selectedGrade,
        gradYear,
        profileImage: '',
        isVerified: true
      });

      // Store user data for the app
      sessionStorage.setItem('userData', JSON.stringify(response.data));

      // Keep selectedSchool for find-friends page, but clear other temp data
      sessionStorage.removeItem('phoneNumber');
      sessionStorage.removeItem('selectedGrade');
      sessionStorage.removeItem('phoneVerified');
      sessionStorage.removeItem('userZipCode');

      router.push('/auth/find-friends');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      setError(error.response?.data?.error || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedSchool || !phoneNumber || selectedGrade === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-white">Almost Done!</h1>
        <p className="mt-2 text-md text-neutral-400 mb-6">
          Just need your name to complete your profile
        </p>

        {/* Show selected school info */}
        <div className="bg-neutral-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-400 mb-1">School</p>
          <p className="font-medium">{selectedSchool.name}</p>
          <p className="text-sm text-neutral-500">
            Grade {selectedGrade} • Graduating {calculateGradYear(selectedGrade)}
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleProfileSetup();
          }}
        >
          <InputField
            id="firstName"
            label="First Name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoFocus
            required
          />
          <InputField
            id="lastInitial"
            label="Last Initial"
            placeholder="D"
            value={lastInitial}
            onChange={(e) => setLastInitial(e.target.value)}
            maxLength={1}
            required
          />

          <Button
            primary
            size="large"
            label={isLoading ? "Creating Profile..." : "Complete Setup"}
            onClick={handleProfileSetup}
            disabled={isLoading || !firstName.trim() || !lastInitial.trim()}
          />

          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
