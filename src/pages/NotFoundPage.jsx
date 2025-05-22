import { Link } from "react-router-dom"

// 404 Not Found page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-6xl font-bold text-[#005580] mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="bg-[#005580] text-white px-6 py-3 rounded-md hover:bg-[#004466] transition-colors">
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
