import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name, schoolId, grade, profileImage } = await request.json();

    // Validate required fields
    if (!phoneNumber || !name || !schoolId) {
      return NextResponse.json(
        { error: 'Phone number, name, and school ID are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!/^\d{10}$/.test(formattedNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate grade if provided
    if (grade && ![9, 10, 11, 12].includes(grade)) {
      return NextResponse.json(
        { error: 'Invalid grade. Must be 9, 10, 11, or 12' },
        { status: 400 }
      );
    }

    try {
      // Check if school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          name: true,
          domain: true,
          city: true,
          state: true,
        }
      });

      if (!school) {
        return NextResponse.json(
          { error: 'School not found' },
          { status: 400 }
        );
      }

      // Check if phone number is already registered
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber: formattedNumber }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        );
      }

      // Generate a temporary password (in production, you might handle this differently)
      const tempPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user profile in database
      const user = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          phoneNumber: formattedNumber,
          name,
          schoolId,
          grade: grade || null,
          profileImage: profileImage || '',
          password: hashedPassword,
          isVerified: true,
          email: null, // Phone-based authentication
        },
        include: {
          School: {
            select: {
              id: true,
              name: true,
              domain: true,
              city: true,
              state: true,
            }
          }
        }
      });

      // Return user data (excluding sensitive information)
      const responseData = {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        schoolId: user.schoolId,
        grade: user.grade,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        school: user.School
      };

      return NextResponse.json(responseData, { status: 201 });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Setup profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    const formattedNumber = phoneNumber.replace(/\D/g, '');

    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedNumber },
      include: {
        School: {
          select: {
            id: true,
            name: true,
            domain: true,
            city: true,
            state: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding sensitive information)
    const responseData = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      schoolId: user.schoolId,
      grade: user.grade,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      school: user.School
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
