// src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      const isDev = import.meta.env.DEV; // Vite's way to check for development mode

      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500" />
            <h1 className="mt-4 text-2xl font-bold">Oops! Something went wrong.</h1>
            <p className="mt-2 text-gray-400">
              We've encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold"
            >
              Refresh Page
            </button>

            {/* --- Developer Information (Only shows in development) --- */}
            {isDev && this.state.error && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-400">Developer Info:</h3>
                <pre className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-400">Click to see component stack</summary>
                  <pre className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;