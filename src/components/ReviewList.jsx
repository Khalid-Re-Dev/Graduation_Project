import { Star } from "lucide-react"

// Review list component for displaying product reviews
function ReviewList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  // Sort reviews by date (newest first)
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-4">
      {sortedReviews.map((review, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <div className="font-medium">{review.user}</div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-700 mb-2">{review.comment}</p>
          <div className="text-xs text-gray-500">
            {new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReviewList
