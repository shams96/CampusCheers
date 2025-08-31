'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

export default function PhoneVerificationPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a selected school
    const selectedSchool = sessionStorage.getItem('selectedSchool');
    if (!selectedSchool) {
      router.push('/auth/zip-code');
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      // Store phone number for verification
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      sessionStorage.setItem('phoneNumber', digitsOnly);

      // Call the API to send SMS
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: digitsOnly }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send SMS');
      }

      setIsCodeSent(true);
      setResendTimer(60); // 60 second cooldown
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const phoneNumber = sessionStorage.getItem('phoneNumber');
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }

      // Call the API to verify the code
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid verification code');
      }

      // Mark phone as verified
      sessionStorage.setItem('phoneVerified', 'true');

      // Navigate to grade selection
      router.push('/auth/select-grade');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      handleSendCode();
    }
  };

  const handleBack = () => {
    router.push('/auth/select-school');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">
          {isCodeSent ? 'Enter Verification Code' : 'Verify Your Phone'}
        </h1>
        <p className="text-md text-neutral-400 mb-8">
          {isCodeSent
            ? `We sent a 6-digit code to ${phoneNumber}`
            : 'Enter your phone number to receive a verification code'
          }
        </p>

        {!isCodeSent ? (
          <div className="space-y-6">
            <InputField
              id="phoneNumber"
              label=""
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength={14}
              autoFocus
              required
            />

            <Button
              primary
              size="large"
              label={isSendingCode ? "Sending..." : "Send Verification Code"}
              onClick={handleSendCode}
              disabled={!phoneNumber || isSendingCode}
            />

            <Button
              size="small"
              label="← Back to school selection"
              onClick={handleBack}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <InputField
              id="verificationCode"
              label=""
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              required
            />

            <div className="space-y-3">
              <Button
                primary
                size="large"
                label={isVerifying ? "Verifying..." : "Verify Code"}
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isVerifying}
              />

              <button
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : 'Resend verification code'
                }
              </button>

              <Button
                size="small"
                label="← Change phone number"
                onClick={() => {
                  setIsCodeSent(false);
                  setVerificationCode('');
                  setError('');
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-500 text-sm">{error}</p>
        )}

        {isCodeSent && (
          <p className="mt-4 text-xs text-neutral-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        )}
      </div>
    </main>
  );
}