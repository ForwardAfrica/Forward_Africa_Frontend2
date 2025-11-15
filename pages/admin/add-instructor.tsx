import React from 'react'
import dynamic from 'next/dynamic'

const AddFacilitatorPage = dynamic(() => import('@/pages/AddFacilitatorPage'), {
  ssr: false
})

export default function AddInstructor() {
  return <AddFacilitatorPage />
}
