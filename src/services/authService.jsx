// This file is deprecated and not used anywhere in the project.
// All authentication logic is handled by src/services/auth.service.js and backend APIs.
// You can safely delete this file.

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phoneNumber: "1234567890",
    address: "123 Main St",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    phoneNumber: "9876543210",
    address: "456 Admin St",
    isAdmin: true,
  },
]

/**
 * Simulate user login
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} - User data and token
 */
export const loginUser = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        reject(new Error("Invalid credentials"))
        return
      }

      // Create a user object without the password
      const { password: _, ...userWithoutPassword } = user

      // Generate a mock token
      const token = `mock-jwt-token-${Date.now()}`

      resolve({
        user: userWithoutPassword,
        token,
      })
    }, 500) // 500ms delay to simulate network request
  })
}

/**
 * Simulate user registration
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and token
 */
export const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === userData.email)

      if (existingUser) {
        reject(new Error("User with this email already exists"))
        return
      }

      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        name: `${userData.firstName} ${userData.lastName}`,
        ...userData,
      }

      // Add to mock database
      mockUsers.push(newUser)

      // Create a user object without the password
      const { password: _, confirmPassword: __, ...userWithoutPassword } = newUser

      // Generate a mock token
      const token = `mock-jwt-token-${Date.now()}`

      resolve({
        user: userWithoutPassword,
        token,
      })
    }, 500) // 500ms delay to simulate network request
  })
}

/**
 * Simulate user logout
 * @returns {Promise<void>}
 */
export const logoutUser = () => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve()
    }, 300) // 300ms delay to simulate network request
  })
}
