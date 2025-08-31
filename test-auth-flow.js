// Test script to verify authentication flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('🧪 Testing CampusCheers Authentication Flow\n');

  try {
    // Test 1: Schools by zip code
    console.log('1️⃣ Testing schools-by-zip endpoint...');
    const schoolsResponse = await axios.get(`${BASE_URL}/api/auth/schools-by-zip?zip=75013`);
    console.log('✅ Schools found:', schoolsResponse.data.schools?.length || 0);
    
    if (schoolsResponse.data.schools && schoolsResponse.data.schools.length > 0) {
      const testSchool = schoolsResponse.data.schools[0];
      console.log('📍 Test school:', testSchool.name);

      // Test 2: Send verification code
      console.log('\n2️⃣ Testing send-verification-code endpoint...');
      const testPhoneNumber = '5551234567';
      
      try {
        const smsResponse = await axios.post(`${BASE_URL}/api/auth/send-verification-code`, {
          phoneNumber: testPhoneNumber
        });
        console.log('✅ SMS sent successfully:', smsResponse.data.message);

        // Test 3: Verify code (using a mock code since we can't get real SMS)
        console.log('\n3️⃣ Testing verify-code endpoint...');
        
        // For testing, we'll manually set a verification code
        // In development mode, the SMS service logs the code to console
        const testCode = '123456'; // This would normally come from SMS
        
        try {
          const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-code`, {
            phoneNumber: testPhoneNumber,
            code: testCode
          });
          console.log('✅ Code verification successful:', verifyResponse.data.message);
        } catch (verifyError) {
          console.log('⚠️ Code verification failed (expected in test):', verifyError.response?.data?.error);
        }

        // Test 4: Setup profile
        console.log('\n4️⃣ Testing setup-profile endpoint...');
        try {
          const profileResponse = await axios.post(`${BASE_URL}/api/auth/setup-profile`, {
            phoneNumber: testPhoneNumber,
            name: 'Test User',
            schoolId: testSchool.id,
            grade: 11
          });
          console.log('✅ Profile created successfully:', profileResponse.data.name);
        } catch (profileError) {
          console.log('⚠️ Profile creation failed:', profileError.response?.data?.error);
        }

      } catch (smsError) {
        console.log('⚠️ SMS sending failed:', smsError.response?.data?.error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAuthFlow().then(() => {
  console.log('\n🏁 Authentication flow test completed!');
}).catch(error => {
  console.error('💥 Test script failed:', error.message);
});
