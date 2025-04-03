import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { StarSystem } from '@/types/InterstellarData'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

async function fetch3DData(): Promise<StarSystem[]> {
  console.log('Fetching JSON (SERVER-SIDE)')

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interstellar_destinations`)

  // if (!res.ok) throw new Error('Failed to fetch JSON')

  const data: StarSystem[] = await res.json()
  console.log('JSON Data on the SERVER:', data)
  return data
}

export default async function Page() {
  const jsonData = await fetch3DData()
  console.log('JSON Data on the SERVER:', jsonData)

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
