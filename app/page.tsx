import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { StarSystem } from '@/types/InterstellarData'

// Dynamically import the Scene component
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

// Fetch data directly in the server component
async function fetch3DData(): Promise<StarSystem[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data.json`)

  if (!res.ok) {
    throw new Error('Failed to fetch JSON data')
  }

  const data: StarSystem[] = await res.json()
  return data
}

// Page component as a server component
export default async function Page() {
  const jsonData = await fetch3DData() // Fetch data here

  return (
    <>
      <Suspense
        fallback={
          <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>Loading...</div>
        }
      >
        <Scene jsonData={jsonData} />
      </Suspense>
    </>
  )
}
