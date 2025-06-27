import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";

function ErrorExplanationPage() {
  // Get error details from state passed by ErrorBoundary
  const location = useLocation();
  const error = location.state?.error;
  const errorInfo = location.state?.errorInfo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center border border-red-200">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-red-700 mb-2">An Error Occurred</h1>
        <p className="text-gray-700 mb-4">
          Sorry, something went wrong while loading the data or displaying the page. This might be caused by one of the following:
        </p>
        <ul className="text-left text-gray-600 mb-4 list-disc pl-6">
          <li>The data from the server is incomplete or unexpected (e.g., missing item or undefined array).</li>
          <li>Internet connection issue or network error.</li>
          <li>A temporary issue with the server or recent updates on the site.</li>
        </ul>
        {error && (
          <div className="bg-red-50 text-red-800 rounded p-2 mb-4 text-xs break-all">
            <b>Error Details:</b> {error.toString()}
          </div>
        )}
        {errorInfo?.componentStack && (
          <div className="bg-gray-50 text-gray-700 rounded p-2 mb-4 text-xs break-all text-left max-h-32 overflow-auto">
            <b>Stack Trace:</b>
            <pre>{errorInfo.componentStack}</pre>
          </div>
        )}
        <Link to="/" className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

export default ErrorExplanationPage;
