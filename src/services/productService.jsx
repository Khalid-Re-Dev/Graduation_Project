// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Smartphone XYZ",
    price: 799,
    image: "/placeholder.svg?height=200&width=300",
    images: [
      "/placeholder.svg?height=400&width=500",
      "/placeholder.svg?height=400&width=500",
      "/placeholder.svg?height=400&width=500",
    ],
    category: "Phones",
    description: "A powerful smartphone with advanced camera system and all-day battery life.",
    stock: 120,
    discount: 10,
    created_at: "2024-04-20",
    popularity: 95,
    likes: 230,
    specifications: {
      display: "6.7-inch Super Retina XDR",
      processor: "A15 Bionic chip",
      memory: "128GB, 256GB, 512GB",
      camera: "12MP dual camera system",
      battery: "Up to 19 hours video playback",
      operating_system: "iOS 15",
    },
    reviews: [
      {
        user: "Ahmed",
        rating: 5,
        comment: "Excellent phone with great battery life!",
        date: "2024-04-21",
      },
      {
        user: "Sarah",
        rating: 4,
        comment: "Good camera quality, but a bit expensive.",
        date: "2024-04-18",
      },
    ],
  },
  {
    id: 2,
    name: "Laptop Pro",
    price: 1299,
    image: "/placeholder.svg?height=200&width=300",
    category: "Computers",
    description: "High-performance laptop for professionals and creatives.",
    stock: 50,
    discount: 0,
    created_at: "2024-04-15",
    popularity: 88,
    likes: 180,
    specifications: {
      display: "15.6-inch Retina display",
      processor: "Intel Core i7, 11th Gen",
      memory: "16GB RAM, 512GB SSD",
      graphics: "NVIDIA GeForce RTX 3050",
      battery: "Up to 10 hours",
      operating_system: "Windows 11 Pro",
    },
    reviews: [
      {
        user: "Michael",
        rating: 5,
        comment: "Perfect for my design work. Fast and reliable.",
        date: "2024-04-16",
      },
    ],
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 199,
    image: "/placeholder.svg?height=200&width=300",
    category: "HeadPhones",
    description: "Premium noise-cancelling wireless headphones with long battery life.",
    stock: 75,
    discount: 15,
    created_at: "2024-04-10",
    popularity: 92,
    likes: 210,
    specifications: {
      type: "Over-ear",
      connectivity: "Bluetooth 5.0",
      battery: "Up to 30 hours",
      noise_cancellation: "Active Noise Cancellation",
      microphone: "Built-in with voice assistant support",
      charging: "USB-C, Fast charging",
    },
    reviews: [
      {
        user: "Emily",
        rating: 5,
        comment: "The noise cancellation is amazing! Perfect for travel.",
        date: "2024-04-12",
      },
      {
        user: "David",
        rating: 4,
        comment: "Great sound quality, comfortable to wear for hours.",
        date: "2024-04-11",
      },
    ],
  },
  {
    id: 4,
    name: "Smartwatch Ultra",
    price: 349,
    image: "/placeholder.svg?height=200&width=300",
    category: "SmartWatch",
    description: "Advanced smartwatch with health monitoring and fitness tracking features.",
    stock: 60,
    discount: 0,
    created_at: "2024-04-05",
    popularity: 85,
    likes: 150,
    specifications: {
      display: "1.4-inch AMOLED",
      sensors: "Heart rate, ECG, Blood oxygen",
      battery: "Up to 18 days",
      water_resistance: "5 ATM",
      connectivity: "Bluetooth, Wi-Fi, GPS",
      compatibility: "iOS and Android",
    },
    reviews: [
      {
        user: "Jessica",
        rating: 5,
        comment: "The battery life is incredible! Love all the health features.",
        date: "2024-04-08",
      },
    ],
  },
  {
    id: 5,
    name: "4K Smart TV",
    price: 899,
    image: "/placeholder.svg?height=200&width=300",
    category: "Electronics",
    description: "Ultra HD Smart TV with vibrant colors and smart assistant integration.",
    stock: 30,
    discount: 5,
    created_at: "2024-04-01",
    popularity: 90,
    likes: 175,
    specifications: {
      display: "55-inch 4K UHD",
      resolution: "3840 x 2160",
      refresh_rate: "120Hz",
      smart_features: "Voice control, App support",
      connectivity: "HDMI x4, USB x3, Wi-Fi, Bluetooth",
      audio: "Dolby Atmos",
    },
    reviews: [
      {
        user: "Robert",
        rating: 4,
        comment: "Great picture quality and smart features work well.",
        date: "2024-04-03",
      },
    ],
  },
  {
    id: 6,
    name: "Gaming Console Pro",
    price: 499,
    image: "/placeholder.svg?height=200&width=300",
    category: "Gaming",
    description: "Next-generation gaming console with stunning graphics and fast performance.",
    stock: 25,
    discount: 0,
    created_at: "2024-03-25",
    popularity: 98,
    likes: 300,
    specifications: {
      processor: "Custom 8-core AMD Zen 2",
      graphics: "10.28 TFLOPS, 36 CUs",
      memory: "16GB GDDR6",
      storage: "1TB SSD",
      resolution: "Up to 8K",
      frame_rate: "Up to 120fps",
    },
    reviews: [
      {
        user: "Alex",
        rating: 5,
        comment: "Amazing graphics and super fast loading times!",
        date: "2024-03-28",
      },
      {
        user: "Chris",
        rating: 5,
        comment: "Best gaming experience I've ever had.",
        date: "2024-03-26",
      },
    ],
  },
  {
    id: 7,
    name: "Digital Camera Pro",
    price: 1499,
    image: "/placeholder.svg?height=200&width=300",
    category: "Camera",
    description: "Professional-grade digital camera with advanced features for photography enthusiasts.",
    stock: 15,
    discount: 10,
    created_at: "2024-03-20",
    popularity: 82,
    likes: 120,
    specifications: {
      sensor: "24.2MP Full-frame CMOS",
      iso_range: "100-51,200 (expandable to 204,800)",
      autofocus: "693-point phase-detection AF",
      video: "4K UHD at 60fps",
      stabilization: "5-axis in-body image stabilization",
      connectivity: "Wi-Fi, Bluetooth, NFC",
    },
    reviews: [
      {
        user: "Sophia",
        rating: 5,
        comment: "Incredible image quality and the autofocus is lightning fast!",
        date: "2024-03-22",
      },
    ],
  },
  {
    id: 8,
    name: "Wireless Earbuds",
    price: 129,
    image: "/placeholder.svg?height=200&width=300",
    category: "HeadPhones",
    description: "True wireless earbuds with premium sound quality and active noise cancellation.",
    stock: 100,
    discount: 0,
    created_at: "2024-03-15",
    popularity: 94,
    likes: 220,
    specifications: {
      type: "In-ear, True Wireless",
      connectivity: "Bluetooth 5.2",
      battery: "Up to 8 hours (28 hours with case)",
      noise_cancellation: "Active Noise Cancellation",
      water_resistance: "IPX4",
      charging: "Wireless charging case, USB-C",
    },
    reviews: [
      {
        user: "Daniel",
        rating: 4,
        comment: "Great sound and comfortable fit. Battery life is impressive.",
        date: "2024-03-18",
      },
      {
        user: "Olivia",
        rating: 5,
        comment: "The noise cancellation works amazingly well for such small earbuds!",
        date: "2024-03-16",
      },
    ],
  },
]

/**
 * Fetch products with optional filtering and sorting
 * @param {Object} options - Filter and sort options
 * @returns {Promise<Array>} - Array of products
 */
export const fetchProducts = (options = {}) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      let filteredProducts = [...mockProducts]

      // Apply category filter if provided
      if (options.category) {
        filteredProducts = filteredProducts.filter((product) => product.category === options.category)
      }

      // Apply search filter if provided
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower),
        )
      }

      // Apply sorting if provided
      if (options.sort) {
        filteredProducts.sort((a, b) => {
          if (options.sort === "price") {
            return options.order === "asc" ? a.price - b.price : b.price - a.price
          } else if (options.sort === "created_at") {
            return options.order === "asc"
              ? new Date(a.created_at) - new Date(b.created_at)
              : new Date(b.created_at) - new Date(a.created_at)
          } else if (options.sort === "popularity") {
            return options.order === "asc" ? a.popularity - b.popularity : b.popularity - a.popularity
          } else if (options.sort === "likes") {
            return options.order === "asc" ? a.likes - b.likes : b.likes - a.likes
          }
          return 0
        })
      }

      resolve(filteredProducts)
    }, 500) // 500ms delay to simulate network request
  })
}

/**
 * Fetch product details by ID
 * @param {number|string} id - Product ID
 * @returns {Promise<Object>} - Product details and related products
 */
export const fetchProductDetails = (id) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const productId = Number.parseInt(id)
      const product = mockProducts.find((p) => p.id === productId)

      if (!product) {
        reject(new Error("Product not found"))
        return
      }

      // Get related products (same category)
      const relatedProducts = mockProducts
        .filter((p) => p.category === product.category && p.id !== productId)
        .slice(0, 4)

      resolve({ product, relatedProducts })
    }, 500) // 500ms delay to simulate network request
  })
}
