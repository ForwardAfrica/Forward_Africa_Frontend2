import React from 'react'
import dynamic from 'next/dynamic'

const AdminLoginPage = dynamic(() => import('@/pages/AdminLoginPage'), {
  ssr: false
})

export default function AdminLogin() {
  return <AdminLoginPage />
}
