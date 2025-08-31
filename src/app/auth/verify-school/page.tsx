'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

export default function VerifySchoolPage() {
  const [schools, setSchools] = useState<{ id: string; name: string; domain: string }[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [localPart, setLocalPart] = useState('');
  const [error, setError] = useState('');
  const [loadingSchools, setLoadingSchools] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/auth/schools')
      .then(res => {
        setSchools(res.data);
        if (res.data.length) {
          setSelectedDomain(res.data[0].domain);
        }
      })
      .catch(() => {
        setError('Failed to load schools.');
      })
      .finally(() => {
        setLoadingSchools(false);
      });
  }, []);

  const handleVerification = async () => {
    setError('');
    if (!localPart) {
      setError('Please enter your email username.');
      return;
    }
    const email = `${localPart}@${selectedDomain}`;
    try {
      await axios.post('/api/auth/verify-school', { email });
      router.push('/auth/setup-profile');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Verification failed.');
      } else {
        setError('Verification failed.');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold">Verify Your School</h1>
        <p className="mt-2 text-md text-neutral-400">
          Select your school and enter your email to get started.
        </p>
        {loadingSchools ? (
          <p className="mt-4">Loading schools...</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerification();
            }}
            className="mt-8 space-y-6"
          >
            <div>
              <label htmlFor="schoolSelect" className="block text-sm font-medium text-white">
                Select Your School
              </label>
              <select
                id="schoolSelect"
                className="mt-1 block w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.domain}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              id="localPart"
              label={`Email Username (@${selectedDomain})`}
              type="text"
              placeholder="yourusername"
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value)}
              required
            />
            <Button
              primary
              size="large"
              label="Send Verification Link"
              onClick={handleVerification}
            />
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </form>
        )}
      </div>
      </main>
   );
}
