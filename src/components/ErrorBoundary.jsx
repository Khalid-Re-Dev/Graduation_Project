import { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // You can also log the error to an error reporting service here
  }

  handleReset = () => {
    // Reset the error boundary state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Attempt to reload the component
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Force a refresh of the data if needed
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center my-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="text-red-600 mb-4">
            {this.props.fallbackMessage || 
             (this.state.error ? this.state.error.toString() : "An unexpected error occurred")}
          </p>
          <div className="mb-4 text-left bg-red-100 p-3 rounded overflow-auto max-h-40 text-xs">
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
