import React from 'react';
import { Link } from 'react-router-dom';

const SimpleProductCard = ({ product }) => {
  // Basic validation
  if (!product || typeof product !== 'object') {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-600">Invalid product data</p>
      </div>
    );
  }

  // Check if this is a category, shop, or brand object instead of a product
  if ('product_count' in product) {
    console.warn('SimpleProductCard received category object:', product);
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-600">Category object received instead of product</p>
      </div>
    );
  }

  if ('owner_name' in product || 'completion_percentage' in product) {
    console.warn('SimpleProductCard received shop object:', product);
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-600">Shop object received instead of product</p>
      </div>
    );
  }

  if ('popularity' in product && 'rating' in product && 'likes' in product && 'dislikes' in product) {
    console.warn('SimpleProductCard received brand object:', product);
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-600">Brand object received instead of product</p>
      </div>
    );
  }

  // Safe product with defaults
  const safeProduct = {
    id: product.id || 'no-id',
    name: product.name || 'Unnamed Product',
    price: product.price || 0,
    image: product.image || product.image_url || 'https://via.placeholder.com/300x300?text=Product',
    // Handle category - it might be an object or string
    category: typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : (product.category || 'Uncategorized')
  };

  console.log('SimpleProductCard rendering:', safeProduct);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      <Link to={`/products/${encodeURIComponent(String(safeProduct.id))}`}>
        <div>
          {/* Product image */}
          <img
            src={safeProduct.image}
            alt={safeProduct.name}
            className="w-full h-48 object-contain mb-4"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
            }}
          />

          {/* Product details */}
          <h3 className="text-lg font-medium mb-1">{String(safeProduct.name)}</h3>
          <p className="text-sm text-gray-600 mb-2">{String(safeProduct.category)}</p>
          <div className="font-bold text-lg">${String(safeProduct.price)}</div>
        </div>
      </Link>
    </div>
  );
};

export default SimpleProductCard;
