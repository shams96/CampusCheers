import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { schoolId, grade, name, email, image } = await request.json()

    if (!schoolId || !grade || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          schoolId,
          grade,
          profileImage: image || user.profileImage,
          isVerified: true,
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: email || session.user.email!,
          name,
          schoolId,
          grade,
          profileImage: image || '',
          password: 'oauth', // Placeholder for OAuth users
          isVerified: true,
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        schoolId: user.schoolId,
        grade: user.grade,
        profileImage: user.profileImage,
      }
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}