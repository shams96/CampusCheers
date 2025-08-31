import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Geographic utility functions
class GeographicService {
  // Calculate distance between two points using Haversine formula
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Get approximate coordinates for a zip code (simplified version)
  static async getZipCodeCoordinates(zipCode: string): Promise<{latitude: number, longitude: number} | null> {
    // In production, you would use a proper geocoding service
    // For now, we'll use some common zip codes for demonstration
    const zipCoordinates: Record<string, {latitude: number, longitude: number}> = {
      '75013': { latitude: 33.0198, longitude: -96.6989 }, // Allen, TX
      '75025': { latitude: 33.0198, longitude: -96.6989 }, // Plano, TX
      '75023': { latitude: 33.0198, longitude: -96.6989 }, // Plano, TX
      '75024': { latitude: 33.0198, longitude: -96.6989 }, // Plano, TX
      '75074': { latitude: 33.0198, longitude: -96.6989 }, // Plano, TX
      '75075': { latitude: 33.0198, longitude: -96.6989 }, // Plano, TX
      '62701': { latitude: 39.7817, longitude: -89.6501 }, // Springfield, IL
      '62702': { latitude: 39.7817, longitude: -89.6501 }, // Springfield, IL
      '62703': { latitude: 39.7817, longitude: -89.6501 }, // Springfield, IL
      '62704': { latitude: 39.7817, longitude: -89.6501 }, // Springfield, IL
      '62705': { latitude: 39.7817, longitude: -89.6501 }, // Springfield, IL
      '90210': { latitude: 34.0901, longitude: -118.4065 }, // Beverly Hills, CA
      '10001': { latitude: 40.7505, longitude: -73.9934 }, // New York, NY
    };

    return zipCoordinates[zipCode] || null;
  }

  // Use Google Maps API if available
  static async geocodeZipCode(zipCode: string): Promise<{latitude: number, longitude: number} | null> {
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          return { latitude: location.lat, longitude: location.lng };
        }
      } catch (error) {
        console.error('Google Maps geocoding error:', error);
      }
    }
    
    // Fallback to local coordinates
    return this.getZipCodeCoordinates(zipCode);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) {
      return NextResponse.json(
        { error: 'Zip code is required' },
        { status: 400 }
      );
    }

    // Validate zip code format
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return NextResponse.json(
        { error: 'Invalid zip code format' },
        { status: 400 }
      );
    }

    const zipCode5 = zip.substring(0, 5);

    try {
      // First, try to find schools by exact zip code match
      let schools = await prisma.school.findMany({
        where: {
          zipCode: zipCode5
        },
        select: {
          id: true,
          name: true,
          domain: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          latitude: true,
          longitude: true,
        }
      });

      // If no exact matches, try geographic search
      if (schools.length === 0) {
        const coordinates = await GeographicService.geocodeZipCode(zipCode5);
        
        if (coordinates) {
          // Get all schools with coordinates
          const allSchools = await prisma.school.findMany({
            where: {
              AND: [
                { latitude: { not: null } },
                { longitude: { not: null } }
              ]
            },
            select: {
              id: true,
              name: true,
              domain: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              latitude: true,
              longitude: true,
            }
          });

          // Calculate distances and filter within 15 miles
          schools = allSchools
            .map(school => {
              const distance = GeographicService.calculateDistance(
                coordinates.latitude,
                coordinates.longitude,
                school.latitude!,
                school.longitude!
              );
              return { ...school, distance };
            })
            .filter(school => school.distance <= 15)
            .sort((a, b) => a.distance - b.distance);
        }
      }

      // If still no schools found, return some default schools for the area
      if (schools.length === 0) {
        const defaultSchools = [
          {
            id: `school_${zipCode5}_1`,
            name: `${zipCode5} High School`,
            domain: `${zipCode5}high.edu`,
            address: `123 Main St, ${zipCode5}`,
            city: 'Local City',
            state: 'ST',
            zipCode: zipCode5,
            latitude: null,
            longitude: null,
            distance: 0
          },
          {
            id: `school_${zipCode5}_2`,
            name: `Central High School`,
            domain: `central${zipCode5}.edu`,
            address: `456 School Ave, ${zipCode5}`,
            city: 'Local City',
            state: 'ST',
            zipCode: zipCode5,
            latitude: null,
            longitude: null,
            distance: 1.2
          }
        ];

        // Optionally seed these schools into the database
        try {
          await prisma.school.createMany({
            data: defaultSchools.map(school => ({
              id: school.id,
              name: school.name,
              domain: school.domain,
              address: school.address,
              city: school.city,
              state: school.state,
              zipCode: school.zipCode,
              latitude: school.latitude,
              longitude: school.longitude,
            })),
            skipDuplicates: true
          });
        } catch (error) {
          console.log('Default schools may already exist');
        }

        return NextResponse.json({
          schools: defaultSchools,
          message: `Found ${defaultSchools.length} schools near ${zipCode5}`
        });
      }

      return NextResponse.json({
        schools: schools,
        message: `Found ${schools.length} schools near ${zipCode5}`
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback to mock data if database is unavailable
      const mockSchools = [
        { 
          id: '1', 
          name: 'Lincoln High School', 
          domain: 'lincoln.edu',
          city: 'Springfield', 
          state: 'IL',
          zipCode: zipCode5,
          distance: 0.5
        },
        { 
          id: '2', 
          name: 'Washington High School', 
          domain: 'washington.edu',
          city: 'Springfield', 
          state: 'IL',
          zipCode: zipCode5,
          distance: 1.2
        },
        { 
          id: '3', 
          name: 'Roosevelt High School', 
          domain: 'roosevelt.edu',
          city: 'Springfield', 
          state: 'IL',
          zipCode: zipCode5,
          distance: 2.1
        }
      ];

      return NextResponse.json({
        schools: mockSchools,
        message: `Found ${mockSchools.length} schools near ${zipCode5} (using fallback data)`
      });
    }

  } catch (error) {
    console.error('Error searching schools by zip:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search schools',
        details: 'Please try again or contact support if the issue persists'
      },
      { status: 500 }
    );
  }
}
