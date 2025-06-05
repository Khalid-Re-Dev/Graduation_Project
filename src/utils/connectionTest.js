/**
 * Connection Test Utility
 * This utility helps test the connection to the remote backend
 */

import { API_BASE_URL } from '../config/api.config';

/**
 * Test connection to the backend server
 * @returns {Promise<Object>} - Connection test results
 */
export const testBackendConnection = async () => {
  const results = {
    baseUrl: API_BASE_URL,
    isConnected: false,
    responseTime: null,
    error: null,
    serverInfo: null
  };

  try {
    const startTime = Date.now();
    
    // Test basic connectivity
    const response = await fetch(API_BASE_URL.replace('/api', '/'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });

    const endTime = Date.now();
    results.responseTime = endTime - startTime;

    if (response.ok) {
      results.isConnected = true;
      
      // Try to get server info if available
      try {
        const data = await response.text();
        results.serverInfo = data;
      } catch (parseError) {
        // Server responded but couldn't parse response - still connected
        results.serverInfo = 'Server responded but content not parseable';
      }
    } else {
      results.error = `HTTP ${response.status}: ${response.statusText}`;
    }

  } catch (error) {
    results.error = error.message;
    
    // Check for specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      results.error = 'Network error - unable to reach server';
    } else if (error.name === 'AbortError') {
      results.error = 'Connection timeout';
    }
  }

  return results;
};

/**
 * Test API endpoints
 * @returns {Promise<Object>} - API test results
 */
export const testApiEndpoints = async () => {
  const endpoints = [
    { name: 'Products', url: '/products/' },
    { name: 'Categories', url: '/categories/' },
    { name: 'Auth Login', url: '/auth/login/' }
  ];

  const results = {
    baseUrl: API_BASE_URL,
    endpoints: []
  };

  for (const endpoint of endpoints) {
    const testResult = {
      name: endpoint.name,
      url: `${API_BASE_URL}${endpoint.url}`,
      isAccessible: false,
      responseTime: null,
      status: null,
      error: null
    };

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout per endpoint
      });

      const endTime = Date.now();
      testResult.responseTime = endTime - startTime;
      testResult.status = response.status;

      // Consider 200, 401 (unauthorized), and 403 (forbidden) as "accessible"
      // since they indicate the endpoint exists
      if ([200, 401, 403].includes(response.status)) {
        testResult.isAccessible = true;
      } else if (response.status === 404) {
        testResult.error = 'Endpoint not found';
      } else {
        testResult.error = `HTTP ${response.status}: ${response.statusText}`;
      }

    } catch (error) {
      testResult.error = error.message;
    }

    results.endpoints.push(testResult);
  }

  return results;
};

/**
 * Run comprehensive connection tests
 * @returns {Promise<Object>} - Complete test results
 */
export const runConnectionTests = async () => {
  console.log('🔍 Testing backend connection...');
  
  const connectionTest = await testBackendConnection();
  console.log('📡 Connection test:', connectionTest);
  
  const apiTest = await testApiEndpoints();
  console.log('🔌 API endpoints test:', apiTest);
  
  return {
    connection: connectionTest,
    api: apiTest,
    summary: {
      isBackendReachable: connectionTest.isConnected,
      workingEndpoints: apiTest.endpoints.filter(e => e.isAccessible).length,
      totalEndpoints: apiTest.endpoints.length
    }
  };
};
