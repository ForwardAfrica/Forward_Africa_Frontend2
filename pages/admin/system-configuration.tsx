import React from 'react'
import dynamic from 'next/dynamic'
import { GetServerSideProps } from 'next'
import ErrorBoundary from '../../src/components/ui/ErrorBoundary'
import AuthGuard from '../../src/components/ui/AuthGuard'

// Dynamic import with SSR disabled for client-side features
const SystemConfigurationPage = dynamic(() => import('../../src/pages/SystemConfigurationPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p>Loading System Configuration...</p>
      </div>
    </div>
  )
})

// Server-side protection with improved error handling
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { req, res } = context

    // Security headers
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3002; frame-ancestors 'none';"
    )

    // Check for suspicious patterns
    const userAgent = req.headers['user-agent'] || ''
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
      return {
        redirect: {
          destination: '/403',
          permanent: false,
        },
      }
    }

    // Extract token from cookies or headers
    const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '')

    // If no token is found, let the client-side handle authentication
    // This prevents unnecessary redirects when the user might be authenticated on the client side
    if (!token) {
      console.log('No token found on server side, allowing client-side authentication check')
      return {
        props: {
          user: null,
          serverTime: new Date().toISOString(),
          csrfToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
      }
    }

    // Verify token with backend only if we have one
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3002'}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.log('Token verification failed on server side, allowing client-side authentication check')
        return {
          props: {
            user: null,
            serverTime: new Date().toISOString(),
            csrfToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          }
        }
      }

      const user = await response.json()

      // Check if user is active
      if (!user.is_active) {
        return {
          redirect: {
            destination: '/403?error=account_suspended',
            permanent: false,
          },
        }
      }

      // Verify super admin role
      if (user.role !== 'super_admin') {
        return {
          redirect: {
            destination: '/403?error=insufficient_permissions',
            permanent: false,
          },
        }
      }

      return {
        props: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions || []
          },
          serverTime: new Date().toISOString(),
          csrfToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
      }

    } catch (error) {
      console.error('Token verification error on server side:', error)
      // Instead of redirecting to login, let the client-side handle authentication
      return {
        props: {
          user: null,
          serverTime: new Date().toISOString(),
          csrfToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
      }
    }

  } catch (error) {
    console.error('Server-side protection error:', error)

    // Instead of redirecting to error page, let the client-side handle authentication
    return {
      props: {
        user: null,
        serverTime: new Date().toISOString(),
        csrfToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }
    }
  }
}

// Main component
export default function SystemConfiguration({ user, serverTime, csrfToken }: {
  user: {
    id: number
    email: string
    role: string
    permissions: string[]
  } | null
  serverTime: string
  csrfToken: string
}) {
  return (
    <ErrorBoundary>
      <AuthGuard requiredRole="Super Admin">
        <SystemConfigurationPage />
      </AuthGuard>
    </ErrorBoundary>
  )
}
