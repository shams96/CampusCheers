'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from './Button'
import { WebAuthnService } from '@/lib/webauthn'

interface BiometricAuthProps {
  onFallback?: () => void
}

export function BiometricAuth({ onFallback }: BiometricAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true)
    setError('')

    try {
      // First, try to authenticate with stored credential
      const result = await WebAuthnService.authenticateBiometric()

      if (result) {
        // Verify the biometric credential with the server
        const response = await fetch('/api/auth/biometric/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credentialId: result.credentialId,
            authenticatorData: result.authenticatorData,
            clientDataJSON: result.clientDataJSON,
            signature: result.signature,
          }),
        })

        if (response.ok) {
          const data = await response.json()

          // Sign in with NextAuth using the verified user
          await signIn('credentials', {
            userId: data.userId,
            redirect: false,
          })

          // Redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          setError('Biometric authentication failed')
        }
      } else {
        setError('Biometric authentication cancelled or failed')
      }
    } catch (err) {
      console.error('Biometric authentication error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="text-center space-y-4">
      <div>
        <div className="text-3xl mb-2">🔐</div>
        <h3 className="text-lg font-semibold mb-2">Welcome back!</h3>
        <p className="text-sm text-neutral-400 mb-4">
          Use your fingerprint or face to sign in
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="space-y-3">
        <Button
          primary
          size="large"
          label={isAuthenticating ? "Authenticating..." : "Sign in with Biometric"}
          onClick={handleBiometricAuth}
          disabled={isAuthenticating}
          className="w-full"
        />

        <div className="text-center">
          <button
            onClick={onFallback}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Use different sign-in method
          </button>
        </div>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Your biometric data stays on your device
      </p>
    </div>
  )
}