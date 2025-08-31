'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

interface School {
  id: string;
  name: string;
  city: string;
  state: string;
}

export default function QuickSignupPage() {
  const [step, setStep] = useState<'location' | 'school' | 'phone' | 'profile'>('location');
  const [zipCode, setZipCode] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastInitial, setLastInitial] = useState('');
  const [grade, setGrade] = useState<number>(10);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const router = useRouter();

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const zip = await getZipCodeFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );

      if (zip) {
        setZipCode(zip);
        // Auto-advance to school selection
        setTimeout(() => {
          handleLocationSubmit(zip);
        }, 1500);
      }
    } catch (error) {
      // User will enter manually
    }
  };

  const getZipCodeFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      return data.postcode || data.zipCode || null;
    } catch (error) {
      return null;
    }
  };

  const handleLocationSubmit = async (submittedZip?: string) => {
    const zipToSubmit = submittedZip || zipCode;
    if (!zipToSubmit || zipToSubmit.length < 5) {
      setError('Please enter a valid zip code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/schools-by-zip?zip=${encodeURIComponent(zipToSubmit)}`);
      if (!response.ok) throw new Error('Failed to fetch schools');

      const apiSchools = await response.json();
      const transformedSchools: School[] = apiSchools.map((school: any) => ({
        id: school.id,
        name: school.name,
        city: 'Nearby',
        state: 'Area'
      }));

      setSchools(transformedSchools);
      sessionStorage.setItem('userZipCode', zipToSubmit);
      setStep('school');

      // Auto-select first school if only one
      if (transformedSchools.length === 1) {
        setSelectedSchoolId(transformedSchools[0].id);
      }
    } catch (err) {
      setError('Failed to find schools in your area');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleSchoolSubmit = () => {
    if (!selectedSchoolId) {
      setError('Please select your school');
      return;
    }

    const selectedSchool = schools.find(s => s.id === selectedSchoolId);
    if (selectedSchool) {
      sessionStorage.setItem('selectedSchool', JSON.stringify(selectedSchool));
      setStep('phone');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      sessionStorage.setItem('phoneNumber', digitsOnly);

      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: digitsOnly }),
      });

      if (!response.ok) throw new Error('Failed to send code');

      setIsCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneNumberDigits = phoneNumber.replace(/\D/g, '');
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumberDigits,
          code: verificationCode
        }),
      });

      if (!response.ok) throw new Error('Invalid verification code');

      sessionStorage.setItem('phoneVerified', 'true');
      setStep('profile');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const selectedSchool = schools.find(s => s.id === selectedSchoolId);
      const name = `${firstName.trim()} ${lastInitial.trim()}.`;

      const response = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          name,
          schoolId: selectedSchoolId,
          grade,
          profileImage: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to create profile');

      const userData = await response.json();
      sessionStorage.setItem('userData', JSON.stringify(userData));

      // Clear temporary data
      sessionStorage.removeItem('selectedSchool');
      sessionStorage.removeItem('phoneNumber');
      sessionStorage.removeItem('phoneVerified');
      sessionStorage.removeItem('userZipCode');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {['location', 'school', 'phone', 'profile'].map((stepName, index) => (
        <div
          key={stepName}
          className={`w-3 h-3 rounded-full ${
            ['location', 'school', 'phone', 'profile'].indexOf(step) >= index
              ? 'bg-blue-500'
              : 'bg-neutral-600'
          }`}
        />
      ))}
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">
          {step === 'location' && 'Welcome to CampusCheers'}
          {step === 'school' && 'Select Your School'}
          {step === 'phone' && (isCodeSent ? 'Enter Code' : 'Verify Phone')}
          {step === 'profile' && 'Complete Your Profile'}
        </h1>

        <p className="text-neutral-400 mb-6 text-sm">
          {step === 'location' && 'Find your school to get started'}
          {step === 'school' && 'Choose your school from the list'}
          {step === 'phone' && (isCodeSent ? 'Enter the code we sent' : 'Enter your phone number')}
          {step === 'profile' && 'Just need your name to finish'}
        </p>

        {renderStepIndicator()}

        <div className="space-y-4">
          {step === 'location' && (
            <>
              <InputField
                id="zipCode"
                label=""
                type="text"
                placeholder="Enter zip code (e.g., 12345)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={10}
                autoFocus
              />
              <Button
                primary
                size="large"
                label={isLoading ? "Finding schools..." : "Continue"}
                onClick={() => handleLocationSubmit()}
                disabled={!zipCode || isLoading}
              />
            </>
          )}

          {step === 'school' && (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    onClick={() => handleSchoolSelect(school.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSchoolId === school.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-sm">{school.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                primary
                size="large"
                label="Continue"
                onClick={handleSchoolSubmit}
                disabled={!selectedSchoolId}
              />
            </>
          )}

          {step === 'phone' && (
            <>
              {!isCodeSent ? (
                <>
                  <InputField
                    id="phoneNumber"
                    label=""
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    maxLength={14}
                    autoFocus
                  />
                  <Button
                    primary
                    size="large"
                    label={isLoading ? "Sending..." : "Send Code"}
                    onClick={handlePhoneSubmit}
                    disabled={!phoneNumber || isLoading}
                  />
                </>
              ) : (
                <>
                  <InputField
                    id="verificationCode"
                    label=""
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                  />
                  <Button
                    primary
                    size="large"
                    label={isLoading ? "Verifying..." : "Verify"}
                    onClick={handleCodeSubmit}
                    disabled={verificationCode.length !== 6 || isLoading}
                  />
                </>
              )}
            </>
          )}

          {step === 'profile' && (
            <>
              <InputField
                id="firstName"
                label=""
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <InputField
                id="lastInitial"
                label=""
                type="text"
                placeholder="Last initial (e.g., D)"
                value={lastInitial}
                onChange={(e) => setLastInitial(e.target.value)}
                maxLength={1}
              />
              <div className="text-left">
                <label htmlFor="grade-select" className="block text-sm font-medium text-neutral-300 mb-2">
                  Grade
                </label>
                <select
                  id="grade-select"
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2"
                >
                  {[9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>{g}th Grade</option>
                  ))}
                </select>
              </div>
              <Button
                primary
                size="large"
                label={isLoading ? "Creating..." : "Complete Setup"}
                onClick={handleProfileSubmit}
                disabled={!firstName.trim() || !lastInitial.trim() || isLoading}
              />
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
}