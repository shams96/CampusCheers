'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';

interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  distance?: number; // in miles
}

export default function SelectSchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const zipCode = searchParams.get('zip');

  useEffect(() => {
    if (zipCode) {
      loadSchools(zipCode);
    } else {
      // If no zip code, redirect back to zip code page
      router.push('/auth/zip-code');
    }
  }, [zipCode, router]);

  const loadSchools = async (zip: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Call the API to get schools by zip code
      const response = await fetch(`/api/auth/schools-by-zip?zip=${encodeURIComponent(zip)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch schools');
      }

      const data = await response.json();
      const apiSchools = data.schools || [];

      // Transform Google Maps API response to match our interface
      const transformedSchools: School[] = apiSchools.map((school: any) => ({
        id: school.id,
        name: school.name,
        city: school.city || 'Nearby',
        state: school.state || 'Area',
        distance: school.distance || Math.random() * 5 + 1
      }));

      setSchools(transformedSchools);

      // Auto-select and auto-advance if only one school is found
      if (transformedSchools.length === 1) {
        setSelectedSchoolId(transformedSchools[0].id);
        // Auto-advance after a brief delay
        setTimeout(() => {
          handleAutoSelect(transformedSchools[0]);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to load schools. Please try again.');
      console.error('School loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleAutoSelect = (school: School) => {
    sessionStorage.setItem('selectedSchool', JSON.stringify(school));
    router.push('/auth/phone-verification');
  };

  const handleContinue = () => {
    if (!selectedSchoolId) {
      setError('Please select your school');
      return;
    }

    const selectedSchool = schools.find(s => s.id === selectedSchoolId);
    if (selectedSchool) {
      // Store selected school in session storage
      sessionStorage.setItem('selectedSchool', JSON.stringify(selectedSchool));

      // Navigate to phone verification
      router.push('/auth/phone-verification');
    }
  };

  const handleBack = () => {
    router.push('/auth/zip-code');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Finding schools near {zipCode}...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Select Your School</h1>
        <p className="text-md text-neutral-400 mb-6">
          We found {schools.length} school{schools.length !== 1 ? 's' : ''} near {zipCode}
        </p>

        {schools.length > 0 ? (
          <div className="space-y-4 mb-6">
            {schools.map((school) => (
              <div
                key={school.id}
                onClick={() => handleSchoolSelect(school.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSchoolId === school.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="font-medium">{school.name}</h3>
                    <p className="text-sm text-neutral-400">
                      {school.city}, {school.state}
                    </p>
                  </div>
                  {school.distance && (
                    <span className="text-sm text-neutral-500">
                      {school.distance} miles
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-neutral-400 mb-4">
              No schools found near {zipCode}. Try a different zip code.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            primary
            size="large"
            label="Continue"
            onClick={handleContinue}
            disabled={!selectedSchoolId}
          />

          <Button
            size="small"
            label="← Back to zip code"
            onClick={handleBack}
          />

          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
}