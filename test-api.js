// Simple API test script
// Run with: node test-api.js

const API_BASE_URL = 'https://binc-b-1.onrender.com/api';

async function testAPI() {
  console.log('🔍 Testing API connectivity...');
  console.log('🌐 Base URL:', API_BASE_URL);
  
  // Test 1: Basic connectivity
  try {
    console.log('\n📡 Test 1: Basic server connectivity');
    const response = await fetch(API_BASE_URL.replace('/api', '/'));
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('❌ Basic connectivity failed:', error.message);
  }

  // Test 2: Products endpoint
  try {
    console.log('\n📦 Test 2: Products endpoint');
    const response = await fetch(`${API_BASE_URL}/products/`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.text();
      console.log('Response length:', data.length);
      console.log('First 200 chars:', data.substring(0, 200));
      
      try {
        const jsonData = JSON.parse(data);
        console.log('JSON parsed successfully');
        console.log('Data type:', typeof jsonData);
        console.log('Is array:', Array.isArray(jsonData));
        if (Array.isArray(jsonData)) {
          console.log('Array length:', jsonData.length);
        } else {
          console.log('Object keys:', Object.keys(jsonData));
        }
      } catch (parseError) {
        console.log('Not valid JSON:', parseError.message);
      }
    }
  } catch (error) {
    console.error('❌ Products endpoint failed:', error.message);
  }

  // Test 3: Categories endpoint
  try {
    console.log('\n📂 Test 3: Categories endpoint');
    const response = await fetch(`${API_BASE_URL}/categories/`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.text();
      console.log('Response length:', data.length);
      console.log('First 200 chars:', data.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Categories endpoint failed:', error.message);
  }

  // Test 4: Auth endpoint
  try {
    console.log('\n🔐 Test 4: Auth login endpoint');
    const response = await fetch(`${API_BASE_URL}/auth/login/`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
  } catch (error) {
    console.error('❌ Auth endpoint failed:', error.message);
  }

  console.log('\n✅ API testing completed');
}

testAPI().catch(console.error);
