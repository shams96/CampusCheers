// WebAuthn utilities for biometric authentication
export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string
  rp: {
    name: string
    id?: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: {
    alg: number
    type: string
  }[]
  authenticatorSelection?: {
    authenticatorAttachment?: string
    requireResidentKey?: boolean
    userVerification?: string
  }
  timeout?: number
  attestation?: string
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string
  allowCredentials?: {
    id: string
    type: string
    transports?: string[]
  }[]
  timeout?: number
  userVerification?: string
  rpId?: string
}

export class WebAuthnService {
  static async isAvailable(): Promise<boolean> {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    )
  }

  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isAvailable()) return false

    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error('Error checking platform authenticator availability:', error)
      return false
    }
  }

  static async registerBiometric(userId: string, userName: string, userDisplayName: string): Promise<{
    credentialId: string
    publicKey: string
    counter: number
  } | null> {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const challengeBase64 = btoa(String.fromCharCode(...challenge))

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON = {
        challenge: challengeBase64,
        rp: {
          name: 'CampusCheers',
          id: window.location.hostname,
        },
        user: {
          id: btoa(userId),
          name: userName,
          displayName: userDisplayName,
        },
        pubKeyCredParams: [
          {
            alg: -7, // ES256
            type: 'public-key',
          },
          {
            alg: -257, // RS256
            type: 'public-key',
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as AuthenticatorAttachment,
          requireResidentKey: false,
          userVerification: 'required' as UserVerificationRequirement,
        },
        timeout: 60000,
        attestation: 'direct',
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: publicKeyCredentialCreationOptions.rp.name,
            id: publicKeyCredentialCreationOptions.rp.id,
          },
          user: {
            id: Uint8Array.from(atob(publicKeyCredentialCreationOptions.user.id), c => c.charCodeAt(0)),
            name: publicKeyCredentialCreationOptions.user.name,
            displayName: publicKeyCredentialCreationOptions.user.displayName,
          },
          pubKeyCredParams: publicKeyCredentialCreationOptions.pubKeyCredParams.map(param => ({
            alg: param.alg,
            type: param.type as 'public-key',
          })),
          authenticatorSelection: publicKeyCredentialCreationOptions.authenticatorSelection,
          timeout: publicKeyCredentialCreationOptions.timeout,
          attestation: publicKeyCredentialCreationOptions.attestation as AttestationConveyancePreference,
        },
      }) as PublicKeyCredential

      if (!credential) return null

      const response = credential.response as AuthenticatorAttestationResponse
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey()!)))
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))

      return {
        credentialId,
        publicKey,
        counter: response.getAuthenticatorData().byteLength, // Simplified counter
      }
    } catch (error) {
      console.error('Error registering biometric:', error)
      return null
    }
  }

  static async authenticateBiometric(credentialId?: string): Promise<{
    credentialId: string
    authenticatorData: string
    clientDataJSON: string
    signature: string
  } | null> {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON = {
        challenge: btoa(String.fromCharCode(...challenge)),
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      }

      if (credentialId) {
        publicKeyCredentialRequestOptions.allowCredentials = [
          {
            id: credentialId,
            type: 'public-key',
            transports: ['internal'],
          },
        ]
      }

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          timeout: publicKeyCredentialRequestOptions.timeout,
          userVerification: publicKeyCredentialRequestOptions.userVerification as UserVerificationRequirement,
          rpId: publicKeyCredentialRequestOptions.rpId,
          allowCredentials: publicKeyCredentialRequestOptions.allowCredentials?.map(cred => ({
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
            type: cred.type as 'public-key',
            transports: cred.transports as AuthenticatorTransport[],
          })),
        },
      }) as PublicKeyCredential

      if (!assertion) return null

      const response = assertion.response as AuthenticatorAssertionResponse

      return {
        credentialId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
        authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        signature: btoa(String.fromCharCode(...new Uint8Array(response.signature))),
      }
    } catch (error) {
      console.error('Error authenticating with biometric:', error)
      return null
    }
  }
}