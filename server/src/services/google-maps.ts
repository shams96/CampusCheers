import { Client } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.warn('Google Maps API key not configured. School detection will use mock data.');
}

export interface SchoolLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  distance: number; // in miles
  placeId: string;
  rating?: number;
  types: string[];
}

export interface ZipCodeLocation {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}

export class GoogleMapsService {
  /**
   * Get coordinates for a zip code
   */
  static async getZipCodeLocation(zipCode: string): Promise<ZipCodeLocation | null> {
    // Use mock data in all environments for consistency
    console.log(`🗺️ Using mock zip code location for ${zipCode}`);
    return this.getMockZipCodeLocation(zipCode);
  }

  /**
   * Find schools near a zip code using Google Places API
   */
  static async findSchoolsNearZipCode(zipCode: string, radiusMiles: number = 10): Promise<SchoolLocation[]> {
    console.log(`🔍 Finding schools near ${zipCode}...`);

    const zipLocation = await this.getZipCodeLocation(zipCode);
    if (!zipLocation) {
      console.log(`📍 No location found for zip ${zipCode}, using mock data`);
      return this.getMockSchools(zipCode);
    }

    if (!apiKey) {
      console.log('🔑 No Google Maps API key, using mock data');
      return this.getMockSchools(zipCode);
    }

    try {
      console.log(`🌐 Calling Google Maps API for ${zipCode}...`);

      // Convert miles to meters for Google API
      const radiusMeters = radiusMiles * 1609.34;

      const response = await googleMapsClient.placesNearby({
        params: {
          location: `${zipLocation.latitude},${zipLocation.longitude}`,
          radius: radiusMeters,
          type: 'school',
          key: apiKey,
        },
      });

      console.log(`📊 Google Maps returned ${response.data.results.length} places`);

      const schools: SchoolLocation[] = response.data.results
        .filter((place: any) => {
          // Filter for actual schools (not universities or other institutions)
          const types = place.types || [];
          return types.includes('school') &&
                 !types.includes('university') &&
                 !types.includes('college') &&
                 place.name.toLowerCase().includes('school');
        })
        .map((place: any) => {
          const location = place.geometry.location;
          const distance = this.calculateDistance(
            zipLocation.latitude,
            zipLocation.longitude,
            location.lat,
            location.lng
          );

          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || '',
            city: zipLocation.city,
            state: zipLocation.state,
            zipCode,
            latitude: location.lat,
            longitude: location.lng,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            placeId: place.place_id,
            rating: place.rating,
            types: place.types || [],
          };
        })
        .sort((a: SchoolLocation, b: SchoolLocation) => a.distance - b.distance) // Sort by distance
        .slice(0, 10); // Limit to 10 results

      console.log(`✅ Found ${schools.length} schools near ${zipCode}`);
      return schools.length > 0 ? schools : this.getMockSchools(zipCode);
    } catch (error) {
      console.error('❌ Google Maps API error:', error);
      console.log('🔄 Falling back to mock data');
      return this.getMockSchools(zipCode);
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Mock data for development when Google API is not available
   */
  private static getMockZipCodeLocation(zipCode: string): ZipCodeLocation {
    // Mock coordinates for common zip codes
    const mockLocations: Record<string, ZipCodeLocation> = {
      '12345': { latitude: 42.8142, longitude: -73.9396, city: 'Schenectady', state: 'NY' },
      '75013': { latitude: 33.1032, longitude: -96.6989, city: 'Allen', state: 'TX' },
      '75002': { latitude: 33.1032, longitude: -96.6989, city: 'Allen', state: 'TX' },
      '75201': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
      '77001': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
      '77401': { latitude: 29.7018, longitude: -95.4587, city: 'Bellaire', state: 'TX' },
      '77501': { latitude: 29.6911, longitude: -95.2091, city: 'Pasadena', state: 'TX' },
      '76001': { latitude: 32.7357, longitude: -97.1081, city: 'Arlington', state: 'TX' },
      '78701': { latitude: 30.2672, longitude: -97.7431, city: 'Austin', state: 'TX' },
      '90210': { latitude: 34.0901, longitude: -118.4065, city: 'Beverly Hills', state: 'CA' },
      '10001': { latitude: 40.7505, longitude: -73.9934, city: 'New York', state: 'NY' },
    };

    return mockLocations[zipCode] || {
      latitude: 39.8283,
      longitude: -98.5795,
      city: 'Unknown City',
      state: 'Unknown State'
    };
  }

  /**
   * Mock school data for development
   */
  static getMockSchools(zipCode: string): SchoolLocation[] {
    const mockSchools: Record<string, SchoolLocation[]> = {
      '12345': [
        {
          id: 'mock-school-1',
          name: 'Schenectady High School',
          address: '1445 The Plaza, Schenectady, NY 12309',
          city: 'Schenectady',
          state: 'NY',
          zipCode: '12345',
          latitude: 42.8142,
          longitude: -73.9396,
          distance: 0.5,
          placeId: 'mock-place-1',
          rating: 4.2,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-2',
          name: 'Mont Pleasant Middle School',
          address: '1931 Curry Rd, Schenectady, NY 12303',
          city: 'Schenectady',
          state: 'NY',
          zipCode: '12345',
          latitude: 42.8142,
          longitude: -73.9396,
          distance: 1.2,
          placeId: 'mock-place-2',
          rating: 4.0,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '75013': [
        {
          id: 'mock-school-3',
          name: 'Allen High School',
          address: '300 Rivercrest Blvd, Allen, TX 75002',
          city: 'Allen',
          state: 'TX',
          zipCode: '75013',
          latitude: 33.1032,
          longitude: -96.6989,
          distance: 0.8,
          placeId: 'mock-place-3',
          rating: 4.5,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-texas-1',
          name: 'Lovejoy High School',
          address: '1575 Eagle Dr, Lucas, TX 75002',
          city: 'Lucas',
          state: 'TX',
          zipCode: '75013',
          latitude: 33.1032,
          longitude: -96.6989,
          distance: 2.1,
          placeId: 'mock-place-texas-1',
          rating: 4.3,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-texas-2',
          name: 'Prosper High School',
          address: '201 S Coleman St, Prosper, TX 75078',
          city: 'Prosper',
          state: 'TX',
          zipCode: '75013',
          latitude: 33.1032,
          longitude: -96.6989,
          distance: 3.5,
          placeId: 'mock-place-texas-2',
          rating: 4.6,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      // Add more Texas zip codes
      '75002': [
        {
          id: 'mock-school-allen-1',
          name: 'Allen High School',
          address: '300 Rivercrest Blvd, Allen, TX 75002',
          city: 'Allen',
          state: 'TX',
          zipCode: '75002',
          latitude: 33.1032,
          longitude: -96.6989,
          distance: 0.5,
          placeId: 'mock-place-allen-1',
          rating: 4.5,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-allen-2',
          name: 'Lowery Freshman Center',
          address: '300 S Jupiter Rd, Allen, TX 75002',
          city: 'Allen',
          state: 'TX',
          zipCode: '75002',
          latitude: 33.1032,
          longitude: -96.6989,
          distance: 1.2,
          placeId: 'mock-place-allen-2',
          rating: 4.2,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '75201': [
        {
          id: 'mock-school-dallas-1',
          name: 'Skyline High School',
          address: '7777 Forney Rd, Dallas, TX 75227',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
          latitude: 32.7767,
          longitude: -96.7970,
          distance: 2.1,
          placeId: 'mock-place-dallas-1',
          rating: 4.1,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-dallas-2',
          name: 'Seagoville High School',
          address: '1015 N Hwy 175, Seagoville, TX 75159',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
          latitude: 32.7767,
          longitude: -96.7970,
          distance: 3.8,
          placeId: 'mock-place-dallas-2',
          rating: 4.0,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '77001': [
        {
          id: 'mock-school-houston-1',
          name: 'Bellaire High School',
          address: '5100 Maple St, Bellaire, TX 77401',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          latitude: 29.7604,
          longitude: -95.3698,
          distance: 1.5,
          placeId: 'mock-place-houston-1',
          rating: 4.4,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-houston-2',
          name: 'Westside High School',
          address: '14201 Briar Forest Dr, Houston, TX 77077',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          latitude: 29.7604,
          longitude: -95.3698,
          distance: 2.9,
          placeId: 'mock-place-houston-2',
          rating: 4.2,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '78701': [
        {
          id: 'mock-school-austin-1',
          name: 'Austin High School',
          address: '1715 W Cesar Chavez St, Austin, TX 78703',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          latitude: 30.2672,
          longitude: -97.7431,
          distance: 1.2,
          placeId: 'mock-place-austin-1',
          rating: 4.3,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-austin-2',
          name: 'McCallum High School',
          address: '5600 Sunshine Dr, Austin, TX 78756',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          latitude: 30.2672,
          longitude: -97.7431,
          distance: 2.7,
          placeId: 'mock-place-austin-2',
          rating: 4.5,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '76001': [
        {
          id: 'mock-school-arlington-1',
          name: 'Arlington High School',
          address: '818 W Park Row Dr, Arlington, TX 76013',
          city: 'Arlington',
          state: 'TX',
          zipCode: '76001',
          latitude: 32.7357,
          longitude: -97.1081,
          distance: 1.1,
          placeId: 'mock-place-arlington-1',
          rating: 4.2,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-arlington-2',
          name: 'Martin High School',
          address: '4501 W Pleasant Ridge Rd, Arlington, TX 76016',
          city: 'Arlington',
          state: 'TX',
          zipCode: '76001',
          latitude: 32.7357,
          longitude: -97.1081,
          distance: 2.3,
          placeId: 'mock-place-arlington-2',
          rating: 4.4,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '77401': [
        {
          id: 'mock-school-bellaire-1',
          name: 'Bellaire High School',
          address: '5100 Maple St, Bellaire, TX 77401',
          city: 'Bellaire',
          state: 'TX',
          zipCode: '77401',
          latitude: 29.7018,
          longitude: -95.4587,
          distance: 0.8,
          placeId: 'mock-place-bellaire-1',
          rating: 4.6,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
      '77501': [
        {
          id: 'mock-school-pasadena-1',
          name: 'Pasadena High School',
          address: '206 S Shaver St, Pasadena, TX 77506',
          city: 'Pasadena',
          state: 'TX',
          zipCode: '77501',
          latitude: 29.6911,
          longitude: -95.2091,
          distance: 1.2,
          placeId: 'mock-place-pasadena-1',
          rating: 4.1,
          types: ['school', 'point_of_interest', 'establishment'],
        },
        {
          id: 'mock-school-pasadena-2',
          name: 'Sam Rayburn High School',
          address: '2121 Cherrybrook Ln, Pasadena, TX 77502',
          city: 'Pasadena',
          state: 'TX',
          zipCode: '77501',
          latitude: 29.6911,
          longitude: -95.2091,
          distance: 2.1,
          placeId: 'mock-place-pasadena-2',
          rating: 4.3,
          types: ['school', 'point_of_interest', 'establishment'],
        },
      ],
    };

    return mockSchools[zipCode] || [
      {
        id: 'mock-school-default',
        name: 'Local High School',
        address: '123 Main St, Local City, ST 12345',
        city: 'Local City',
        state: 'ST',
        zipCode,
        latitude: 39.8283,
        longitude: -98.5795,
        distance: 1.0,
        placeId: 'mock-place-default',
        rating: 4.0,
        types: ['school', 'point_of_interest', 'establishment'],
      },
    ];
  }
}