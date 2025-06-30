"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import ProductCard from "../components/ProductCard"
import { Search, Filter } from "lucide-react"

// Product comparison API call (calls backend on Render)
async function compareProductsAPI(productIds, token) {
  const response = await fetch("https://binc-b.onrender.com/api/comparison/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ product_ids: productIds }),
  });
  if (!response.ok) throw new Error("Failed to fetch comparison data");
  return await response.json();
}

function ComparePage() {
  const { allProducts, loading } = useSelector((state) => state.products)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState(null)
  // Use Redux compare list for selected products
  const compareItems = useSelector((state) => state.compare.items || [])

  // Get unique categories
  const categories = [
    ...new Map(
      allProducts
        .map((product) => {
          const cat = product.category;
          if (!cat) return null;
          if (typeof cat === "object" && cat !== null) {
            return { id: cat.id, name: cat.name };
          }
          return { id: cat, name: cat };
        })
        .filter(Boolean)
        .map((cat) => [cat.id, cat])
    ).values(),
  ];

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    let productCategory = product.category;
    let productCategoryId = productCategory;
    if (typeof productCategory === "object" && productCategory !== null) {
      productCategoryId = productCategory.id;
    }
    const matchesCategory = selectedCategory === "" || productCategoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });


  // No need for local toggleCompare logic; handled in ProductCard via Redux

  // Fetch comparison automatically when compareItems changes
  useEffect(() => {
    const fetchComparison = async () => {
      if (!compareItems || compareItems.length < 2) {
        setComparison(null);
        return;
      }
      setCompareLoading(true);
      setCompareError(null);
      setComparison(null);
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const data = await compareProductsAPI(compareItems.map(p => p.id), token);
        setComparison(data);
      } catch (err) {
        setCompareError("Failed to fetch comparison data.");
      } finally {
        setCompareLoading(false);
      }
    };
    fetchComparison();
  }, [compareItems]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Product Comparison</h1>

        {/* Comparison table */}
        <div className="mb-8">
          {comparison && Array.isArray(comparison.products) && comparison.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full mt-6 border rounded-lg text-center shadow-sm bg-white">
                <thead>
                  <tr className="bg-[#e6f7f7] text-[#005580]">
                    <th className="py-3 px-2 border-b">Name</th>
                    <th className="py-3 px-2 border-b">Brand</th>
                    <th className="py-3 px-2 border-b">Price</th>
                    <th className="py-3 px-2 border-b">Rating</th>
                    <th className="py-3 px-2 border-b">Likes</th>
                    <th className="py-3 px-2 border-b">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Highlight min/max values per column */}
                  {
                    (() => {
                      const minPrice = Math.min(...comparison.products.map(p => typeof p.price === 'number' ? p.price : Number.POSITIVE_INFINITY));
                      const maxRating = Math.max(...comparison.products.map(p => typeof p.rating === 'number' ? p.rating : Number.NEGATIVE_INFINITY));
                      const maxLikes = Math.max(...comparison.products.map(p => typeof p.likes === 'number' ? p.likes : Number.NEGATIVE_INFINITY));
                      return comparison.products.map((prod) => {
                        // Extract brand name only
                        let brandName = "N/A";
                        if (prod.brand_obj && prod.brand_obj.name) {
                          brandName = prod.brand_obj.name;
                        } else if (typeof prod.brand === 'object' && prod.brand && prod.brand.name) {
                          brandName = prod.brand.name;
                        } else if (prod.brand_name) {
                          brandName = prod.brand_name;
                        } else if (typeof prod.brand === 'string') {
                          brandName = prod.brand;
                        }

                        // Defensive: ensure all values are valid for rendering
                        const safeName = typeof prod.name === 'object' ? JSON.stringify(prod.name) : (prod.name ?? 'N/A');
                        const safeBrand = brandName ?? 'N/A';
                        const safePrice = prod.price ?? 'N/A';
                        const safeRating = prod.rating ?? 'N/A';
                        const safeLikes = prod.likes ?? 'N/A';

                        // Highlight best by type
                        // prod.best_by = 'rating' | 'likes' | 'views' | undefined
                        let bestLabel = null;
                        if (prod.is_best && prod.best_by) {
                          let color = '';
                          let text = '';
                          if (prod.best_by === 'rating') {
                            color = 'bg-[#1dbf73]';
                            text = 'Best Rating';
                          } else if (prod.best_by === 'likes') {
                            color = 'bg-[#ffb300]';
                            text = 'Most Liked';
                          } else if (prod.best_by === 'views') {
                            color = 'bg-[#007bff]';
                            text = 'Most Viewed';
                          }
                          bestLabel = (
                            <span className={`inline-block px-3 py-1 rounded-full ${color} text-white font-bold shadow`}>
                              {text} ⭐
                            </span>
                          );
                        } else if (prod.is_best) {
                          bestLabel = (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#1dbf73] text-white font-bold shadow">Best ⭐</span>
                          );
                        }

                        // Highlight min/max cells
                        const priceCellClass = prod.price === minPrice ? 'bg-blue-100 font-bold' : '';
                        const ratingCellClass = prod.rating === maxRating ? 'bg-blue-100 font-bold' : '';
                        const likesCellClass = prod.likes === maxLikes ? 'bg-blue-100 font-bold' : '';
                        return (
                          <tr
                            key={prod.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="py-2 px-2 border-b">{safeName}</td>
                            <td className="py-2 px-2 border-b">{safeBrand}</td>
                            <td className={`py-2 px-2 border-b ${priceCellClass}`}>{safePrice}</td>
                            <td className={`py-2 px-2 border-b ${ratingCellClass}`}>{safeRating}</td>
                            <td className={`py-2 px-2 border-b ${likesCellClass}`}>{safeLikes}</td>
                            <td className="py-2 px-2 border-b">{bestLabel}</td>
                          </tr>
                        );
                      });
                    })()}
                </tbody>
              </table>
              {/* Only show the note if it is not the unwanted Arabic message and is not empty/whitespace */}
              {(comparison.note &&
                !/تم وسم المنتج الأفضل بناءً على التقييم وعدد المشاهدات\.?/i.test(comparison.note) &&
                comparison.note.trim() !== "" &&
                /[a-zA-Z0-9]/.test(comparison.note)) && (
                  <div className="mt-2 text-sm text-[#005580] text-center font-semibold">{comparison.note}</div>
              )}
            </div>
          ) : comparison && comparison.products && Array.isArray(comparison.products) && comparison.products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-lg text-gray-500">
              No comparison data available.
            </div>
          ) : null}
        </div>

        {/* Search and filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a product to compare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div className="md:w-64">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580] appearance-none"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Product selection for comparison is now via the compare button in ProductCard only */}

        {/* Product grid */}
        {compareLoading && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-blue-200 border-t-[#005580] rounded-full"></div>
            <h2 className="text-2xl font-bold mb-4">Loading comparison...</h2>
          </div>
        )}
        {compareError && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">An error occurred while fetching comparison</h2>
            <p className="mb-6 text-red-600">{compareError}</p>
          </div>
        )}
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg">No products match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Debug info for troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-2 mb-4 text-xs">
          <div><b>Compare Items:</b> {JSON.stringify(compareItems)}</div>
          <div><b>Comparison:</b> {JSON.stringify(comparison)}</div>
        </div>
        {/* Selected products from home are passed to the compare page automatically via Redux compareItems */}
      </div>
    </div>
  )
}

export default ComparePage
