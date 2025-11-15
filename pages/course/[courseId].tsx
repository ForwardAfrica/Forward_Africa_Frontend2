import dynamic from 'next/dynamic'

// Dynamically import CoursePage to avoid SSR issues
const CoursePage = dynamic(() => import('@/pages/CoursePage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading course...</p>
      </div>
    </div>
  )
})

export default function Course() {
  return <CoursePage />
}
