import React from 'react'
import dynamic from 'next/dynamic'

const ManageUsersPage = dynamic(() => import('@/pages/ManageUsersPage'), {
  ssr: false
})

export default function ManageUsers() {
  return <ManageUsersPage />
}
