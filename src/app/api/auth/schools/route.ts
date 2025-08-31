import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all schools from the database
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        city: true,
        state: true,
        zipCode: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // If no schools in database, return some default schools
    if (schools.length === 0) {
      const defaultSchools = [
        {
          id: 'school_1',
          name: 'Lincoln High School',
          domain: 'lincoln.edu',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701'
        },
        {
          id: 'school_2',
          name: 'Washington High School',
          domain: 'washington.edu',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702'
        },
        {
          id: 'school_3',
          name: 'Roosevelt High School',
          domain: 'roosevelt.edu',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703'
        },
        {
          id: 'school_4',
          name: 'Jefferson High School',
          domain: 'jefferson.edu',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704'
        },
        {
          id: 'school_5',
          name: 'Madison High School',
          domain: 'madison.edu',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62705'
        }
      ];

      // Optionally seed the database with default schools
      try {
        await prisma.school.createMany({
          data: defaultSchools,
          skipDuplicates: true
        });
      } catch (error) {
        console.log('Schools may already exist in database');
      }

      return NextResponse.json(defaultSchools);
    }

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, domain, city, state, zipCode, address, latitude, longitude } = await request.json();

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'School name and domain are required' },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name,
        domain,
        city,
        state,
        zipCode,
        address,
        latitude,
        longitude,
      }
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  }
}
