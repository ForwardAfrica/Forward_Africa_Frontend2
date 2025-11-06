import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { FirebaseAuthProvider } from '../src/contexts/FirebaseAuthContext'
import { PermissionProvider } from '../src/contexts/PermissionContext'
import { TokenStatusIndicator } from '../src/components/ui/TokenStatusIndicator'
import GlobalErrorBoundary from '../src/components/ui/GlobalErrorBoundary'
import '../src/index.css'
// Import console storage utilities for global access
import '../src/utils/consoleStorage'

// Firebase Auth Initializer Component
const FirebaseAuthInitializer = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Global error handlers to suppress noisy extension/devtools errors
    // (e.g. MetaMask inpage script or Next.js version notices) so they don't
    // trigger the React error overlay during development.
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      try {
        const reason = (ev && (ev.reason && (typeof ev.reason === 'string' ? ev.reason : ev.reason.message))) || '';
        const stack = ev && ev.reason && ev.reason.stack ? ev.reason.stack : '';

        if (
          reason.includes('Failed to connect to MetaMask') ||
          stack.includes('chrome-extension://') ||
          reason.includes('Next.js (') ||
          (typeof reason === 'string' && reason.toLowerCase().includes('metamask'))
        ) {
          // Prevent the error from surfacing to the overlay
          ev.preventDefault();
          console.warn('Suppressed unhandledrejection from extension/devtools:', reason || stack);
        }
      } catch (e) {
        // Ignore errors in the handler
      }
    };

    const onError = (ev: ErrorEvent) => {
      try {
        const msg = ev && ev.message ? ev.message : '';
        const filename = ev && (ev.filename || '');

        if (
          msg.includes('Failed to connect to MetaMask') ||
          filename.startsWith('chrome-extension://') ||
          msg.includes('Next.js (') ||
          msg.toLowerCase().includes('metamask')
        ) {
          // Prevent the default reporting (which can trigger the overlay)
          ev.preventDefault();
          console.warn('Suppressed window error from extension/devtools:', msg || filename);
        }
      } catch (e) {
        // Ignore errors in the handler
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  // Firebase Auth handles token management automatically
  // No need for manual token refresh setup

  return null;
};

// Client-side only components to prevent hydration issues
const ClientOnlyComponents = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Token Status Indicator - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <TokenStatusIndicator
            showDetails={true}
            showRefreshButton={true}
            className=""
          />
        </div>
      )}
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalErrorBoundary>
      <FirebaseAuthProvider>
        <PermissionProvider>
          <FirebaseAuthInitializer />
          <Component {...pageProps} />
          <ClientOnlyComponents />
        </PermissionProvider>
      </FirebaseAuthProvider>
    </GlobalErrorBoundary>
  )
}
