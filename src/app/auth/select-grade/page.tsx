'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

const GRADES = [
  { value: 9, label: '9th Grade (Freshman)' },
  { value: 10, label: '10th Grade (Sophomore)' },
  { value: 11, label: '11th Grade (Junior)' },
  { value: 12, label: '12th Grade (Senior)' },
];

export default function SelectGradePage() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const router = useRouter();

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
  };

  const handleContinue = () => {
    if (!selectedGrade) return;

    // Store selected grade
    sessionStorage.setItem('selectedGrade', selectedGrade.toString());

    // Navigate to profile setup
    router.push('/auth/setup-profile');
  };

  const handleBack = () => {
    router.push('/auth/phone-verification');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">What's Your Grade?</h1>
        <p className="text-md text-neutral-400 mb-8">
          This helps us connect you with the right classmates
        </p>

        <div className="space-y-3 mb-8">
          {GRADES.map((grade) => (
            <div
              key={grade.value}
              onClick={() => handleGradeSelect(grade.value)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedGrade === grade.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }`}
            >
              <div className="text-center">
                <span className="text-lg font-medium">{grade.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            primary
            size="large"
            label="Continue"
            onClick={handleContinue}
            disabled={!selectedGrade}
          />

          <Button
            size="small"
            label="← Back to phone verification"
            onClick={handleBack}
          />
        </div>
      </div>
    </main>
  );
}