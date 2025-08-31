'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { BiometricSetup } from '@/components/BiometricSetup'

interface School {
  id: string
  name: string
  domain: string
}

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Try to auto-detect school from email domain
      const email = session.user.email
      if (email) {
        const domain = email.split('@')[1]
        loadSchools(domain)
      }
    }
  }, [status, session, router])

  const loadSchools = async (domain?: string) => {
    try {
      const response = await fetch('/api/auth/schools')
      if (response.ok) {
        const allSchools = await response.json()
        setSchools(allSchools)

        // Auto-select school if domain matches
        if (domain) {
          const matchingSchool = allSchools.find((school: School) =>
            school.domain === domain
          )
          if (matchingSchool) {
            setSelectedSchool(matchingSchool)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load schools:', error)
    }
  }

  const handleCompleteOnboarding = async () => {
    if (!selectedSchool || grade === null) {
      setError('Please select your school and grade')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create or update user profile with Google data
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: selectedSchool.id,
          grade,
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        }),
      })

      if (response.ok) {
        // Show biometric setup instead of immediately redirecting
        setShowBiometricSetup(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to complete setup')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricSuccess = () => {
    router.push('/dashboard')
  }

  const handleBiometricSkip = () => {
    router.push('/dashboard')
  }

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (!session?.user) {
    return null
  }

  if (showBiometricSetup) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center max-w-md w-full">
          <BiometricSetup
            userId={session.user.email || ''}
            userName={session.user.name || ''}
            userDisplayName={session.user.name || ''}
            onSuccess={handleBiometricSuccess}
            onSkip={handleBiometricSkip}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name}!</h1>
        <p className="text-lg text-neutral-400 mb-8">
          Let's get you connected with your school community
        </p>

        {/* User info from Google */}
        <div className="bg-neutral-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-neutral-400">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* School Selection */}
        <div className="mb-6">
          <label htmlFor="school-select" className="block text-sm font-medium text-white mb-2">
            Confirm Your School
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
            <option value="">Select your school</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Selection */}
        <div className="mb-6">
          <label htmlFor="grade-select" className="block text-sm font-medium text-white mb-2">
            What grade are you in?
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

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <Button
          primary
          size="large"
          label={isLoading ? "Setting up..." : "Complete Setup"}
          onClick={handleCompleteOnboarding}
          disabled={!selectedSchool || grade === null || isLoading}
          className="w-full"
        />

        <p className="text-xs text-neutral-500 mt-4">
          Your information is protected and complies with student privacy laws.
        </p>
      </div>
    </main>
  )
}