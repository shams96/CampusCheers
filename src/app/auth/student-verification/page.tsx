'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { InputField } from '@/components/InputField'

interface School {
  id: string
  name: string
  domain: string
  city?: string
  state?: string
  zipCode?: string
  distance?: number
}

type VerificationStep = 'zip-code' | 'select-school' | 'phone-verification' | 'select-grade' | 'setup-profile'

export default function StudentVerificationPage() {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('zip-code')
  const [zipCode, setZipCode] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [grade, setGrade] = useState<number | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastInitial, setLastInitial] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()

  // Auto-detect location on component mount
  useEffect(() => {
    detectUserLocation()
  }, [])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const detectUserLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // In a real app, you'd reverse geocode to get zip code
            // For now, we'll just show a common zip code
            setZipCode('75013') // Allen, TX as example
          },
          (error) => {
            console.log('Geolocation not available, user will enter manually')
          }
        )
      }
    } catch (error) {
      console.log('Geolocation not supported')
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

  const handleZipCodeSubmit = async () => {
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid 5-digit zip code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/auth/schools-by-zip?zip=${zipCode}`)
      if (response.ok) {
        const data = await response.json()
        setSchools(data.schools || [])
        setCurrentStep('select-school')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to find schools in your area')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchoolSubmit = () => {
    if (!selectedSchool) {
      setError('Please select your school')
      return
    }
    setCurrentStep('phone-verification')
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
        setResendTimer(60)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
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
        setCurrentStep('select-grade')
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

  const handleGradeSubmit = () => {
    if (grade === null) {
      setError('Please select your grade')
      return
    }
    setCurrentStep('setup-profile')
    setError('')
  }

  const handleProfileSubmit = async () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      setError('Please enter your first name and last initial')
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
          name: `${firstName.trim()} ${lastInitial.trim()}.`,
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

  const getStepNumber = () => {
    const steps: VerificationStep[] = ['zip-code', 'select-school', 'phone-verification', 'select-grade', 'setup-profile']
    return steps.indexOf(currentStep) + 1
  }

  const renderProgressIndicator = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full ${
            getStepNumber() >= step ? 'bg-blue-500' : 'bg-neutral-600'
          }`}
        />
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 'zip-code':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">What's your zip code?</h2>
            <p className="text-neutral-400 mb-6">
              We'll use this to find schools in your area
            </p>
            <InputField
              id="zipCode"
              label="Zip Code"
              type="text"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              autoFocus
            />
            <Button
              primary
              size="large"
              label={isLoading ? "Searching..." : "Find Schools"}
              onClick={handleZipCodeSubmit}
              disabled={!zipCode || zipCode.length < 5 || isLoading}
              className="w-full mt-4"
            />
          </>
        )

      case 'select-school':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Select your school</h2>
            <p className="text-neutral-400 mb-6">
              Found {schools.length} schools near {zipCode}
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
              {schools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSchool?.id === school.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className="font-medium">{school.name}</div>
                  {school.city && school.state && (
                    <div className="text-sm text-neutral-400">
                      {school.city}, {school.state}
                      {school.distance && ` • ${school.distance.toFixed(1)} miles`}
                    </div>
                  )}
                </div>
              ))}
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
        )

      case 'phone-verification':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Verify your phone number</h2>
            <p className="text-neutral-400 mb-6">
              We'll send you a verification code to confirm your identity
            </p>
            {!isCodeSent ? (
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
                  className="w-full mt-4"
                />
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-green-400 mb-2">Code sent to {phoneNumber}</p>
                  <p className="text-sm text-neutral-400">
                    Enter the 6-digit code you received
                  </p>
                </div>
                <InputField
                  id="verificationCode"
                  label="Verification Code"
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
                  label={isLoading ? "Verifying..." : "Verify Code"}
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="w-full mt-4"
                />
                {resendTimer > 0 ? (
                  <p className="text-center text-sm text-neutral-400 mt-4">
                    Resend code in {resendTimer} seconds
                  </p>
                ) : (
                  <button
                    onClick={handleSendCode}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 mt-4"
                  >
                    Resend code
                  </button>
                )}
              </>
            )}
          </>
        )

      case 'select-grade':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">What grade are you in?</h2>
            <p className="text-neutral-400 mb-6">
              This helps us create age-appropriate communities
            </p>
            <div className="space-y-3 mb-6">
              {[
                { value: 9, label: '9th Grade (Freshman)' },
                { value: 10, label: '10th Grade (Sophomore)' },
                { value: 11, label: '11th Grade (Junior)' },
                { value: 12, label: '12th Grade (Senior)' }
              ].map((gradeOption) => (
                <div
                  key={gradeOption.value}
                  onClick={() => setGrade(gradeOption.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    grade === gradeOption.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className="font-medium">{gradeOption.label}</div>
                </div>
              ))}
            </div>
            <Button
              primary
              size="large"
              label="Continue"
              onClick={handleGradeSubmit}
              disabled={grade === null}
              className="w-full"
            />
          </>
        )

      case 'setup-profile':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Complete your profile</h2>
            <p className="text-neutral-400 mb-6">
              Just a few more details to get you started
            </p>
            <div className="space-y-4">
              <InputField
                id="firstName"
                label="First Name"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <InputField
                id="lastInitial"
                label="Last Initial"
                type="text"
                placeholder="D"
                value={lastInitial}
                onChange={(e) => setLastInitial(e.target.value.slice(0, 1).toUpperCase())}
                maxLength={1}
              />
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Verification Summary</h3>
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>School: {selectedSchool?.name}</p>
                  <p>Grade: {grade}th Grade</p>
                  <p>Phone: {phoneNumber}</p>
                </div>
              </div>
            </div>
            <Button
              primary
              size="large"
              label={isLoading ? "Creating Profile..." : "Complete Setup"}
              onClick={handleProfileSubmit}
              disabled={!firstName.trim() || !lastInitial.trim() || isLoading}
              className="w-full mt-6"
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Join CampusCheers</h1>
        <p className="text-md text-neutral-400 mb-6">
          Connect with your verified school community
        </p>

        {renderProgressIndicator()}

        <div className="text-left">
          {renderStepContent()}

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to sign-in options
          </button>
        </div>
      </div>
    </main>
  )
}
