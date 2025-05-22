"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addReview } from "../store/productSlice"
import { Star } from "lucide-react"

// Review form component for adding product reviews
function ReviewForm({ productId }) {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert("Please login to add a review")
      return
    }

    if (!comment.trim()) {
      alert("Please enter a comment")
      return
    }

    const review = {
      user: user?.name || "Anonymous",
      rating,
      comment,
      date: new Date().toISOString(),
    }

    dispatch(addReview({ productId, review }))
    setComment("")
    setRating(5)
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p>
          Please{" "}
          <a href="/login" className="text-[#005580] font-medium">
            login
          </a>{" "}
          to add a review
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    (hoveredRating ? star <= hoveredRating : star <= rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
            placeholder="Share your experience with this product..."
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-[#005580] text-white py-2 px-4 rounded-md hover:bg-[#004466] transition-colors"
        >
          Submit Review
        </button>
      </form>
    </div>
  )
}

export default ReviewForm
