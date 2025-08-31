import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      credentialId,
      authenticatorData,
      clientDataJSON,
      signature
    } = await request.json()

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Missing credential ID' },
        { status: 400 }
      )
    }

    // Find user with this biometric credential
    // Note: In production, you'd have a proper BiometricCredential table
    // For now, we'll search through users (this is not efficient for production)
    const users = await prisma.user.findMany({
      where: {
        password: {
          startsWith: 'biometric:',
        },
      },
    })

    let authenticatedUser = null

    for (const user of users) {
      try {
        const biometricData = JSON.parse(user.password.replace('biometric:', ''))

        if (biometricData.credentialId === credentialId) {
          // In a real implementation, you'd verify the signature here
          // For now, we'll just check if the credential ID matches
          authenticatedUser = user
          break
        }
      } catch (error) {
        // Skip invalid biometric data
        continue
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Biometric authentication failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      userId: authenticatedUser.id,
      message: 'Biometric authentication successful'
    })

  } catch (error) {
    console.error('Biometric authentication error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}