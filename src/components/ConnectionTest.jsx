import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API_BASE_URL } from '../config/api.config';
import { runConnectionTests } from '../utils/connectionTest';
import { productService } from '../services/product.service';
import { fetchAllProducts } from '../store/productSlice';

/**
 * Connection Test Component
 * Displays the current backend configuration and tests connectivity
 */
const ConnectionTest = () => {
  const dispatch = useDispatch();
  const productState = useSelector(state => state.products);
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productTest, setProductTest] = useState(null);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await runConnectionTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        error: error.message,
        connection: { isConnected: false, error: error.message },
        api: { endpoints: [] },
        summary: { isBackendReachable: false, workingEndpoints: 0, totalEndpoints: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testProductAPI = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing product API...');

      // Test raw API response first
      const rawResponse = await fetch(`${API_BASE_URL}/products/`);
      const rawText = await rawResponse.text();

      console.log('📡 Raw API Response Status:', rawResponse.status);
      console.log('📡 Raw API Response Headers:', Object.fromEntries(rawResponse.headers.entries()));
      console.log('📡 Raw API Response Text (first 500 chars):', rawText.substring(0, 500));

      let rawData;
      try {
        rawData = JSON.parse(rawText);
        console.log('✅ JSON parsing successful');
        console.log('📦 Parsed data type:', typeof rawData);
        console.log('📦 Is array:', Array.isArray(rawData));
        console.log('📦 Data keys:', Object.keys(rawData || {}));
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        throw new Error(`JSON parsing failed: ${parseError.message}`);
      }

      // Now test through the service layer
      const products = await productService.getProducts();

      setProductTest({
        success: true,
        products: products,
        count: products.length,
        error: null,
        rawResponse: {
          status: rawResponse.status,
          headers: Object.fromEntries(rawResponse.headers.entries()),
          dataType: typeof rawData,
          isArray: Array.isArray(rawData),
          keys: Object.keys(rawData || {}),
          firstItem: Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null
        }
      });
      console.log('✅ Product API test completed:', products);
    } catch (error) {
      console.error('❌ Product API test failed:', error);
      setProductTest({
        success: false,
        products: [],
        count: 0,
        error: error.message,
        rawResponse: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testReduxFlow = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Testing Redux flow...');
      console.log('📊 Current Redux state:', productState);

      await dispatch(fetchAllProducts()).unwrap();

      console.log('✅ Redux dispatch completed');
      console.log('📊 Updated Redux state:', productState);
    } catch (error) {
      console.error('❌ Redux flow test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Backend Connection Status</h2>
        <p className="text-gray-600">Current backend URL: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}</code></p>
      </div>

      <div className="mb-4 space-x-2">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={testProductAPI}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Product API'}
        </button>
        <button
          onClick={testReduxFlow}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Redux Flow'}
        </button>
      </div>

      {testResults && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${testResults.connection.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Backend Connection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 ${testResults.connection.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.connection.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {testResults.connection.responseTime && (
                <div>
                  <span className="font-medium">Response Time:</span> 
                  <span className="ml-2">{testResults.connection.responseTime}ms</span>
                </div>
              )}
              {testResults.connection.error && (
                <div className="md:col-span-2">
                  <span className="font-medium">Error:</span> 
                  <span className="ml-2 text-red-600">{testResults.connection.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
            <div className="space-y-2">
              {testResults.api.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${endpoint.isAccessible ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">{endpoint.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {endpoint.status && <span className="mr-2">HTTP {endpoint.status}</span>}
                    {endpoint.responseTime && <span>{endpoint.responseTime}ms</span>}
                    {endpoint.error && <span className="text-red-600">{endpoint.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Backend Status:</span> 
                <span className={`ml-2 ${testResults.summary.isBackendReachable ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.summary.isBackendReachable ? '✅ Reachable' : '❌ Unreachable'}
                </span>
              </div>
              <div>
                <span className="font-medium">Working Endpoints:</span> 
                <span className="ml-2">{testResults.summary.workingEndpoints}/{testResults.summary.totalEndpoints}</span>
              </div>
            </div>
          </div>

          {/* Redux State Display */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Redux Store State</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">All Products:</span>
                  <span className="ml-2">{productState.allProducts?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Loading:</span>
                  <span className={`ml-2 ${productState.loading ? 'text-yellow-600' : 'text-green-600'}`}>
                    {productState.loading ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Error:</span>
                  <span className={`ml-2 ${productState.error ? 'text-red-600' : 'text-green-600'}`}>
                    {productState.error || 'None'}
                  </span>
                </div>
              </div>
              {productState.allProducts?.length > 0 && (
                <div>
                  <span className="font-medium">First Product in Store:</span>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(productState.allProducts[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Product API Test Results */}
          {productTest && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${productTest.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Product API Test
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${productTest.success ? 'text-green-600' : 'text-red-600'}`}>
                      {productTest.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Products Found:</span>
                    <span className="ml-2">{productTest.count}</span>
                  </div>
                </div>
                {productTest.error && (
                  <div className="text-sm">
                    <span className="font-medium">Error:</span>
                    <span className="ml-2 text-red-600">{productTest.error}</span>
                  </div>
                )}
                {productTest.rawResponse && (
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Raw API Response:</span>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                        <div><strong>Status:</strong> {productTest.rawResponse.status}</div>
                        <div><strong>Data Type:</strong> {productTest.rawResponse.dataType}</div>
                        <div><strong>Is Array:</strong> {productTest.rawResponse.isArray ? 'Yes' : 'No'}</div>
                        <div><strong>Keys:</strong> {productTest.rawResponse.keys.join(', ')}</div>
                      </div>
                    </div>
                    {productTest.rawResponse.firstItem && (
                      <div>
                        <span className="font-medium">First Item Structure:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(productTest.rawResponse.firstItem, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                {productTest.success && productTest.products.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Processed Product (First Item):</span>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(productTest.products[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {!testResults.summary.isBackendReachable && (
            <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">⚠️ Connection Issues</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Check if the backend server is running and accessible</p>
                <p>• Verify the backend URL is correct</p>
                <p>• Check your internet connection</p>
                <p>• Ensure CORS is properly configured on the backend</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
