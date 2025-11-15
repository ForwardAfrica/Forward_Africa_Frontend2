import React from 'react'
import dynamic from 'next/dynamic'

const CategoryPage = dynamic(() => import('@/pages/CategoryPage'), {
  ssr: false
})

export default function Category() {
  return <CategoryPage />
}
