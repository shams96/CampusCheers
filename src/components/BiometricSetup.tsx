'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { WebAuthnService } from '@/lib/webauthn'

interface BiometricSetupProps {
  userId: string
  userName: string
  userDisplayName: string
  onSuccess?: () => void
  onSkip?: () => void
}

export function BiometricSetup({
  userId,
  userName,
  userDisplayName,
  onSuccess,
  onSkip
}: BiometricSetupProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAvailability()
  }, [])

  const checkAvailability = async () => {
    const available = await WebAuthnService.isPlatformAuthenticatorAvailable()
    setIsAvailable(available)
  }

  const handleRegisterBiometric = async () => {
    setIsRegistering(true)
    setError('')

    try {
      const result = await WebAuthnService.registerBiometric(userId, userName, userDisplayName)

      if (result) {
        // Store the biometric credential
        const response = await fetch('/api/auth/biometric/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credentialId: result.credentialId,
            publicKey: result.publicKey,
            counter: result.counter,
          }),
        })

        if (response.ok) {
          onSuccess?.()
        } else {
          setError('Failed to save biometric credential')
        }
      } else {
        setError('Biometric registration failed')
      }
    } catch (err) {
      console.error('Biometric registration error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsRegistering(false)
    }
  }

  if (isAvailable === null) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-sm text-neutral-400">Checking biometric availability...</p>
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className="text-center space-y-4">
        <div className="text-neutral-400">
          <p className="text-sm mb-2">🔒 Biometric authentication not available</p>
          <p className="text-xs">
            Your device doesn't support biometric login, or it's not enabled in your browser settings.
          </p>
        </div>
        <Button
          size="small"
          label="Continue"
          onClick={onSkip}
        />
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div>
        <div className="text-2xl mb-2">🔐</div>
        <h3 className="text-lg font-semibold mb-2">Enable Quick Login</h3>
        <p className="text-sm text-neutral-400 mb-4">
          Use your fingerprint or face to sign in instantly next time
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="space-y-3">
        <Button
          primary
          size="medium"
          label={isRegistering ? "Setting up..." : "Enable Biometric Login"}
          onClick={handleRegisterBiometric}
          disabled={isRegistering}
        />

        <Button
          size="small"
          label="Skip for now"
          onClick={onSkip}
        />
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Your biometric data is stored securely and never leaves your device
      </p>
    </div>
  )
}