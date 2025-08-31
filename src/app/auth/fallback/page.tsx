'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { InputField } from '@/components/InputField'

interface School {
  id: string
  name: string
  domain: string
}

export default function FallbackAuthPage() {
  const [step, setStep] = useState<'school' | 'phone' | 'verify' | 'profile'>('school')
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [grade, setGrade] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const response = await fetch('/api/auth/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (error) {
      console.error('Failed to load schools:', error)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    }
    return digits
  }

  const handleSchoolSubmit = () => {
    if (!selectedSchool) {
      setError('Please select your school')
      return
    }
    setStep('phone')
    setError('')
  }

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.replace(/\D/g, '') }),
      })

      if (response.ok) {
        setIsCodeSent(true)
        setStep('verify')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          code: verificationCode
        }),
      })

      if (response.ok) {
        setStep('profile')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Invalid verification code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || grade === null) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          name: `${firstName.trim()} ${lastName.trim()}`,
          schoolId: selectedSchool?.id,
          grade,
          profileImage: '',
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create profile')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {['school', 'phone', 'verify', 'profile'].map((stepName, index) => (
        <div
          key={stepName}
          className={`w-3 h-3 rounded-full ${
            ['school', 'phone', 'verify', 'profile'].indexOf(step) >= index
              ? 'bg-blue-500'
              : 'bg-neutral-600'
          }`}
        />
      ))}
    </div>
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Alternative Sign-in</h1>
        <p className="text-md text-neutral-400 mb-6">
          For schools without Google Workspace
        </p>

        {renderStepIndicator()}

        <div className="space-y-4">
          {step === 'school' && (
            <>
              <div className="text-left">
                <label htmlFor="school-select" className="block text-sm font-medium text-white mb-2">
                  Select Your School
                </label>
                <select
                  id="school-select"
                  value={selectedSchool?.id || ''}
                  onChange={(e) => {
                    const school = schools.find(s => s.id === e.target.value)
                    setSelectedSchool(school || null)
                  }}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-3"
                >
                  <option value="">Choose your school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                primary
                size="large"
                label="Continue"
                onClick={handleSchoolSubmit}
                disabled={!selectedSchool}
                className="w-full"
              />
            </>
          )}

          {step === 'phone' && (
            <>
              <InputField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                maxLength={14}
              />
              <Button
                primary
                size="large"
                label={isLoading ? "Sending..." : "Send Verification Code"}
                onClick={handleSendCode}
                disabled={!phoneNumber || isLoading}
                className="w-full"
              />
            </>
          )}

          {step === 'verify' && (
            <>
              <InputField
                id="verificationCode"
                label="Verification Code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
              <Button
                primary
                size="large"
                label={isLoading ? "Verifying..." : "Verify Code"}
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full"
              />
            </>
          )}

          {step === 'profile' && (
            <>
              <InputField
                id="firstName"
                label="First Name"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <InputField
                id="lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <div className="text-left">
                <label htmlFor="grade-select" className="block text-sm font-medium text-white mb-2">
                  Grade
                </label>
                <select
                  id="grade-select"
                  value={grade || ''}
                  onChange={(e) => setGrade(parseInt(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-3"
                >
                  <option value="">Select your grade</option>
                  {[9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      {g}th Grade
                    </option>
                  ))}
                </select>
              </div>
              <Button
                primary
                size="large"
                label={isLoading ? "Creating..." : "Complete Setup"}
                onClick={handleProfileSubmit}
                disabled={!firstName.trim() || !lastName.trim() || grade === null || isLoading}
                className="w-full"
              />
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to main sign-in
          </button>
        </div>
      </div>
    </main>
  )
}