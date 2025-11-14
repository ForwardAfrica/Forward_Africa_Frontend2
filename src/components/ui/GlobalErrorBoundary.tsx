import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Mail, Phone } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  showDetails: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);

    // Log error to monitoring service (if available)
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      id: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.log('Error ID:', errorData.id);
      console.log('Error:', errorData.error);
      console.log('Component Stack:', errorData.errorInfo.componentStack);
      console.log('User Agent:', errorData.userAgent);
      console.log('URL:', errorData.url);
      console.groupEnd();
    }

    // Send to error reporting service (if configured)
    this.sendErrorReport(errorData);
  };

  private getCurrentUserId = (): string | null => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  };

  private sendErrorReport = (errorData: any) => {
    // In a real application, you would send this to your error reporting service
    // For now, we'll just store it locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingErrors.unshift(errorData);
      localStorage.setItem('errorReports', JSON.stringify(existingErrors.slice(0, 50)));
    } catch (error) {
      console.error('Failed to store error report:', error);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      showDetails: false
    });
  };

  private handleGoHome = () => {
    // Navigate to home - reload page to reset error state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `);

    window.open(`mailto:support@fowardafrica.com?subject=${subject}&body=${body}`, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-gray-400">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Error Information</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">ID: {this.state.errorId}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="text-xs"
                  >
                    {this.state.showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Error:</span>
                  <span className="ml-2 text-red-400">{this.state.error?.message}</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="ml-2">{this.state.error?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">URL:</span>
                  <span className="ml-2 text-blue-400">{window.location.href}</span>
                </div>
              </div>

              {/* Detailed Error Information */}
              {this.state.showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-semibold mb-2">Technical Details</h3>
                  <div className="bg-gray-900 rounded p-3 text-xs font-mono overflow-auto max-h-40">
                    <div className="text-red-400 mb-2">Stack Trace:</div>
                    <pre className="whitespace-pre-wrap text-gray-300">
                      {this.state.error?.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <div className="text-red-400 mb-2 mt-4">Component Stack:</div>
                        <pre className="whitespace-pre-wrap text-gray-300">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button
                variant="primary"
                onClick={this.handleRetry}
                className="flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoBack}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={this.handleContactSupport}
                className="flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>

            {/* Support Information */}
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <h3 className="text-sm font-semibold mb-2">Need Help?</h3>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@fowardafrica.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+234 XXX XXX XXXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
