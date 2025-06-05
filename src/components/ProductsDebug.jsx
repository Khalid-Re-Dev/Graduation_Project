import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllProducts } from '../store/productSlice';
import { productService } from '../services/product.service';

const ProductsDebug = () => {
  const dispatch = useDispatch();
  const { allProducts, loading, error } = useSelector(state => state.products);
  const [directApiTest, setDirectApiTest] = useState(null);

  const testDirectAPI = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      const result = await productService.getProducts();
      console.log('📦 Direct API result:', result);
      setDirectApiTest({
        success: true,
        data: result,
        count: result?.length || 0
      });
    } catch (error) {
      console.error('❌ Direct API failed:', error);
      setDirectApiTest({
        success: false,
        error: error.message,
        count: 0
      });
    }
  };

  const testReduxFetch = async () => {
    try {
      console.log('🔄 Testing Redux fetch...');
      const result = await dispatch(fetchAllProducts()).unwrap();
      console.log('📊 Redux fetch result:', result);
    } catch (error) {
      console.error('❌ Redux fetch failed:', error);
    }
  };

  useEffect(() => {
    testDirectAPI();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Products Debug Dashboard</h2>
      
      {/* Redux State */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Redux State</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Products Count:</strong> {allProducts?.length || 0}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Error:</strong> {error || 'None'}
          </div>
        </div>
        {allProducts?.length > 0 && (
          <div className="mt-2">
            <strong>First Product:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(allProducts[0], null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Direct API Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Direct API Test</h3>
        <button 
          onClick={testDirectAPI}
          className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Direct API
        </button>
        {directApiTest && (
          <div className="text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong>Success:</strong> {directApiTest.success ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Count:</strong> {directApiTest.count}
              </div>
              <div>
                <strong>Error:</strong> {directApiTest.error || 'None'}
              </div>
            </div>
            {directApiTest.success && directApiTest.data?.length > 0 && (
              <div className="mt-2">
                <strong>First Item:</strong>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                  {JSON.stringify(directApiTest.data[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Redux Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Redux Fetch Test</h3>
        <button 
          onClick={testReduxFetch}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Redux Fetch
        </button>
      </div>

      {/* Console Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-lg font-semibold mb-2">Debug Instructions</h3>
        <p className="text-sm">
          1. Open browser console (F12)<br/>
          2. Click "Test Direct API" and check console logs<br/>
          3. Click "Test Redux Fetch" and check console logs<br/>
          4. Compare the results above with what you see in console
        </p>
      </div>
    </div>
  );
};

export default ProductsDebug;
