// Token Status Indicator Component
// Displays current token status and provides manual refresh functionality

import React, { useState, useEffect } from 'react';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';

interface TokenStatusIndicatorProps {
  showDetails?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

export const TokenStatusIndicator: React.FC<TokenStatusIndicatorProps> = ({
  showDetails = false,
  showRefreshButton = true,
  className = '',
}) => {
  const { tokenStatus, refreshState, refreshToken } = useTokenRefresh();
  const [isClient, setIsClient] = useState(false);

  // Set client flag on mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  // NOTE: Token expiry redirects are now handled by AuthContext
  // This component only displays status, it doesn't redirect anymore
  // useEffect(() => {
  //   if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
  //     setShouldRedirectToLogin(true);
  //     const timer = setTimeout(() => {
  //       window.location.href = '/login';
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [tokenStatus.isExpired, tokenStatus.isAuthenticated]);

  const handleRefresh = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const getStatusColor = () => {
    if (tokenStatus.isExpired) return 'text-red-500';
    if (tokenStatus.shouldRefresh) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (tokenStatus.isExpired) return '🔴';
    if (tokenStatus.shouldRefresh) return '🟡';
    return '🟢';
  };

  const getStatusText = () => {
    if (tokenStatus.isExpired) return 'Expired';
    if (tokenStatus.shouldRefresh) return 'Needs Refresh';
    return 'Valid';
  };

  const timeUntilExpiry = tokenStatus.expiryTime
    ? Math.max(0, Math.floor((tokenStatus.expiryTime - Date.now()) / 1000))
    : null;

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className={`token-status-indicator ${className}`}>
      {/* Status Icon */}
      <div className="flex items-center space-x-2">
        <span className={getStatusColor()}>{getStatusIcon()}</span>
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Detailed Status (if enabled) */}
      {showDetails && (
        <div className="mt-2 text-xs space-y-1">
          <div>
            <strong>Status:</strong> {getStatusText()}
          </div>
          <div>
            <strong>Time Until Expiry:</strong> {timeUntilExpiry || 'Unknown'}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {tokenStatus.isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Should Refresh:</strong> {tokenStatus.shouldRefresh ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Refreshing:</strong> {refreshState.isRefreshing ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Refresh Count:</strong> {refreshState.refreshCount}
          </div>
          {refreshState.lastRefreshTime && (
            <div>
              <strong>Last Refresh:</strong> {new Date(refreshState.lastRefreshTime).toLocaleTimeString()}
            </div>
          )}
          {tokenStatus.expiryTime && (
            <div>
              <strong>Expires At:</strong> {new Date(tokenStatus.expiryTime).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Debug Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshState.isRefreshing}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {refreshState.isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
          </button>

          <button
            onClick={() => {
              console.log('Token Status:', tokenStatus);
              console.log('Refresh State:', refreshState);
            }}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Log Status
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin-only token status component
export const AdminTokenStatusIndicator: React.FC<TokenStatusIndicatorProps> = (props) => {
  const { tokenStatus } = useTokenRefresh();

  // Only show for admin users
  if (!tokenStatus.isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-token-status">
      <div className="text-xs text-gray-500 mb-1">Admin Token Status</div>
      <TokenStatusIndicator {...props} showDetails={true} />
    </div>
  );
};

// Minimal status indicator for production
export const MinimalTokenStatus: React.FC = () => {
  const { tokenStatus, refreshState } = useTokenRefresh();

  if (!tokenStatus.isAuthenticated) {
    return null;
  }

  return (
    <div className="minimal-token-status">
      <div className={`inline-block w-2 h-2 rounded-full ${
        tokenStatus.isExpired ? 'bg-red-500' :
        tokenStatus.shouldRefresh ? 'bg-yellow-500' :
        'bg-green-500'
      }`} />

      {refreshState.isRefreshing && (
        <span className="ml-1 text-xs text-gray-500">🔄</span>
      )}
    </div>
  );
};
