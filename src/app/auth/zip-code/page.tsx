'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

export default function ZipCodePage() {
  const [zipCode, setZipCode] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Location detection not supported');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      // Use reverse geocoding to get zip code from coordinates
      const zip = await getZipCodeFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );

      if (zip) {
        setZipCode(zip);
        // Auto-advance after a brief delay to show the user
        setTimeout(() => {
          handleZipCodeSubmit(zip);
        }, 1500);
      }
    } catch (error) {
      console.log('Location detection failed, user will enter manually');
      // Don't show error, just let user enter manually
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getZipCodeFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
    try {
      // Using a free geocoding service (you might want to use a paid service for production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();

      // Try to get postal code from various possible fields
      return data.postcode || data.zipCode || null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  const validateZipCode = (zip: string): boolean => {
    // US zip code validation (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const handleZipCodeSubmit = async (submittedZipCode?: string) => {
    const zipToSubmit = submittedZipCode || zipCode;

    if (!validateZipCode(zipToSubmit)) {
      setLocationError('Please enter a valid US zip code (e.g., 12345)');
      return;
    }

    setIsValidating(true);
    setLocationError('');

    try {
      // Store zip code in session/local storage for the next steps
      sessionStorage.setItem('userZipCode', zipToSubmit);

      // Navigate to school selection with zip code as query param
      router.push(`/auth/select-school?zip=${zipToSubmit}`);
    } catch (error) {
      setLocationError('Something went wrong. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualEntry = () => {
    setIsLoadingLocation(false);
    setLocationError('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Welcome to CampusCheers</h1>
        <p className="text-md text-neutral-400 mb-8">
          Let's find your school to get you connected with friends
        </p>

        {isLoadingLocation ? (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm text-neutral-400">Finding your location...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-white mb-2">
                Enter your zip code
              </label>
              <InputField
                id="zipCode"
                label=""
                type="text"
                placeholder="12345"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={10}
                autoFocus
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                We'll use this to show schools near you
              </p>
            </div>

            <Button
              primary
              size="large"
              label={isValidating ? "Finding schools..." : "Continue"}
              onClick={() => handleZipCodeSubmit()}
              disabled={!zipCode || isValidating}
            />

            {locationError && (
              <p className="mt-2 text-red-500 text-sm">{locationError}</p>
            )}

            {!isLoadingLocation && (
              <button
                onClick={detectLocation}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
                disabled={isLoadingLocation}
              >
                🔄 Try auto-detecting location again
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}