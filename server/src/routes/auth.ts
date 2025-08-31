import { Router } from 'express';
import prisma from '../lib/prisma';
import cacheService from '../lib/cache';
import { SMSService } from '../services/sms';
import { GoogleMapsService, SchoolLocation } from '../services/google-maps';

// Extend global type for verification codes storage
declare global {
  var verificationCodes: Map<string, { code: string; expiry: Date }> | undefined;
}

const router = Router();

// Get schools by zip code proximity using Google Maps
router.get('/schools-by-zip', async (req, res) => {
  const { zip } = req.query;
  if (!zip || typeof zip !== 'string') {
    return res.status(400).json({ error: 'Zip code is required' });
  }

  try {
    console.log(`🔍 SCHOOLS-BY-ZIP ENDPOINT CALLED with zip: ${zip}`);

    // For demo purposes, use mock data since Google Maps API key is invalid
    console.log('🔧 Using mock school data for demo');
    const googleSchools = GoogleMapsService.getMockSchools(zip);

    console.log(`📚 Mock data returned ${googleSchools.length} schools near ${zip}`);
    console.log('First school:', googleSchools[0]);
    console.log('All schools:', googleSchools);

    // Transform Google Maps data to match our expected format
    const schools = googleSchools.map((school: any) => ({
      id: school.placeId || school.id,
      name: school.name,
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      zipCode: school.zipCode || zip,
      latitude: school.latitude || 0,
      longitude: school.longitude || 0,
      distance: school.distance || 0,
      rating: school.rating || 0,
      types: school.types || [],
    }));

    console.log(`📤 Returning ${googleSchools.length} schools to frontend`);
    console.log('Schools data:', googleSchools);

    // Return schools in the format expected by frontend
    res.json(googleSchools);
  } catch (error) {
    console.error('School search error:', error);
    res.status(500).json({
      error: 'Failed to search schools',
      details: 'Please try again or contact support if the issue persists'
    });
  }
});

// Test endpoint to verify mock data
router.get('/test-schools', async (req, res) => {
  const { zip } = req.query;
  const zipCode = (zip as string) || '75013';

  console.log(`🧪 TEST ENDPOINT CALLED with zip: ${zipCode}`);

  const mockSchools = GoogleMapsService.getMockSchools(zipCode);
  console.log(`🧪 Mock schools for ${zipCode}:`, mockSchools);

  res.json({
    zipCode,
    schools: mockSchools,
    count: mockSchools.length
  });
});

// Send SMS verification code
router.post('/send-verification-code', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!SMSService.validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const verificationCode = SMSService.generateVerificationCode();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code (in production, use Redis or similar)
    global.verificationCodes = global.verificationCodes || new Map();
    global.verificationCodes.set(phoneNumber, {
      code: verificationCode,
      expiry: expiryTime
    });

    const smsResult = await SMSService.sendVerificationCode(phoneNumber, verificationCode);

    if (smsResult.success) {
      res.json({ message: 'Verification code sent successfully' });
    } else {
      res.status(500).json({ error: smsResult.error || 'Failed to send SMS' });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify SMS code
router.post('/verify-code', async (req, res) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) {
    return res.status(400).json({ error: 'Phone number and code are required' });
  }

  try {
    global.verificationCodes = global.verificationCodes || new Map();
    const storedData = global.verificationCodes.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }

    if (new Date() > storedData.expiry) {
      global.verificationCodes.delete(phoneNumber);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid, clean up
    global.verificationCodes.delete(phoneNumber);

    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Setup Profile (updated for phone-based auth)
router.post('/setup-profile', async (req, res) => {
  const { phoneNumber, name, schoolId, grade, gradYear, profileImage } = req.body;

  if (!phoneNumber || !name || !schoolId) {
    return res.status(400).json({
      error: 'Phone number, name, and school ID are required'
    });
  }

  try {
    // Check if school exists (with caching)
    const schoolCacheKey = `school:id:${schoolId}`;
    let school = await cacheService.get(schoolCacheKey);

    if (!school) {
      school = await prisma.school.findUnique({
        where: { id: schoolId },
      });

      // Cache the school data for 24 hours (86400 seconds)
      if (school) {
        await cacheService.set(schoolCacheKey, school, 86400);
      }
    }

    if (!school) {
      return res.status(400).json({ error: 'School not found' });
    }

    // For now, create a temporary email from phone number for compatibility
    const tempEmail = `${phoneNumber}@phone.local`;

    // Create user (will be updated after migration to use phoneNumber)
    const user = await prisma.user.create({
      data: {
        id: Date.now().toString(), // Generate unique ID for composite key
        email: tempEmail, // TODO: Replace with phoneNumber after migration
        name,
        profileImage: profileImage || '',
        schoolId,
        // TODO: After migration, add: grade, isVerified: true
        password: 'phone-auth', // Placeholder for phone-based auth
      } as any
    });

    // Cache the user data for 1 hour (3600 seconds)
    const userCacheKey = `user:id:${user.id}`;
    await cacheService.set(userCacheKey, user, 3600);

    res.json(user);
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Legacy routes for backward compatibility
router.post('/verify-school', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const schoolDomain = email.split('@')[1];
  // Try to get school from cache first
  const cacheKey = `school:domain:${schoolDomain}`;
  let school = await cacheService.get(cacheKey);

  if (!school) {
    school = await prisma.school.findUnique({
      where: { domain: schoolDomain },
    });

    // Cache the school data for 24 hours (86400 seconds)
    if (school) {
      await cacheService.set(cacheKey, school, 86400);
    }
  }

  if (!school) {
    return res.status(400).json({ error: 'School not found' });
  }

  res.json({ message: 'Verification link sent!' });
});

router.get('/schools', async (req, res) => {
  // Try to get schools from cache first
  const cacheKey = 'all_schools';
  let schools = await cacheService.get(cacheKey);

  if (!schools) {
    schools = await prisma.school.findMany({
      select: { id: true, name: true, domain: true },
    });

    // Cache the schools data for 24 hours (86400 seconds)
    await cacheService.set(cacheKey, schools, 86400);
  }

  res.json(schools);
});

export default router;
