import React from 'react'
import dynamic from 'next/dynamic'

const InstructorPage = dynamic(() => import('@/pages/InstructorPage'), {
  ssr: false
})

export default function Instructor() {
  return <InstructorPage />
}
