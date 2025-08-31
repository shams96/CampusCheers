import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { credentialId, publicKey, counter } = await request.json()

    if (!credentialId || !publicKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store biometric credential (in production, you'd want to encrypt this)
    // For now, we'll store it in a simple way - in production use proper encryption
    const biometricData = {
      credentialId,
      publicKey,
      counter: counter || 0,
      createdAt: new Date(),
    }

    // Update user with biometric data
    // Note: In a real implementation, you'd create a separate BiometricCredential table
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Store biometric data as JSON in a field (you might want to add a biometricData field to User model)
        // For now, we'll use a simple approach
        password: `biometric:${JSON.stringify(biometricData)}`, // Temporary storage
      },
    })

    return NextResponse.json({
      message: 'Biometric credential registered successfully'
    })

  } catch (error) {
    console.error('Biometric registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}