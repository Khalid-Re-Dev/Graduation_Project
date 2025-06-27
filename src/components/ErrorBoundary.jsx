import { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";

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
      // إذا حدث خطأ، انتقل تلقائياً إلى صفحة شرح الأخطاء مع تمرير تفاصيل الخطأ عبر state
      return (
        <Navigate
          to="/error-explanation"
          replace
          state={{ error: this.state.error, errorInfo: this.state.errorInfo }}
        />
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
