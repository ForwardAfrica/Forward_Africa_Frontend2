import React from 'react'
import dynamic from 'next/dynamic'
import AuthGuard from '../../src/components/ui/AuthGuard'

const AdminDashboardPage = dynamic(() => import('../../src/pages/AdminDashboardPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="text-white text-lg">Loading admin dashboard...</span>
      </div>
    </div>
  )
})

export default function Dashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboardPage />
    </AuthGuard>
  )
}
