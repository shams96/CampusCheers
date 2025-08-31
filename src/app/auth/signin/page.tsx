'use client'

import { getProviders, signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { BiometricAuth } from '@/components/BiometricAuth'
import { WebAuthnService } from '@/lib/webauthn'

type Provider = {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBiometric, setShowBiometric] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      // Get providers
      const providers = await getProviders()
      setProviders(providers)

      // Check biometric availability
      const available = await WebAuthnService.isPlatformAuthenticatorAvailable()
      setBiometricAvailable(available)

      // Check if user is already signed in
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
        return
      }

      // Show biometric option if available
      if (available) {
        setShowBiometric(true)
      }

      setLoading(false)
    }

    initializeAuth()
  }, [router])

  const handleSignIn = async (providerId: string) => {
    try {
      const result = await signIn(providerId, {
        callbackUrl: '/auth/onboarding',
        redirect: false
      })
      if (result?.ok) {
        router.push('/auth/onboarding')
      } else {
        console.error('Sign in failed:', result)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleBiometricFallback = () => {
    setShowBiometric(false)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to CampusCheers</h1>
        <p className="text-lg text-neutral-400 mb-8">
          Connect with your school community
        </p>

        {showBiometric && biometricAvailable ? (
          <BiometricAuth onFallback={handleBiometricFallback} />
        ) : (
          <div className="space-y-4">
            {providers && Object.values(providers).map((provider) => (
              <Button
                key={provider.id}
                primary
                size="large"
                label={`Sign in with ${provider.name}`}
                onClick={() => handleSignIn(provider.id)}
                className="w-full"
              />
            ))}

            {/* Student Verification Flow - Primary Option */}
            <div className="mt-8 pt-8 border-t border-neutral-700">
              <p className="text-sm text-neutral-400 mb-4">
                New to CampusCheers? Join your school community
              </p>
              <Button
                primary
                size="large"
                label="Student Verification"
                onClick={() => router.push('/auth/student-verification')}
                className="w-full mb-4"
              />
              <p className="text-xs text-neutral-500 mb-4">
                Secure 5-step verification process designed for high school students
              </p>
              
              {/* Alternative fallback option */}
              <Button
                size="medium"
                label="Alternative Sign-in"
                onClick={() => router.push('/auth/fallback')}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-neutral-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
            We comply with COPPA and FERPA regulations for student data protection.
          </p>
        </div>
      </div>
    </main>
  )
}
