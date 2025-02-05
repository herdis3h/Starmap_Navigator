import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

async function fetch3DData() {
  console.log('Fetching JSON securely... (SERVER-SIDE)', process.env.API_SECRET)

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interstellar_destinations`, {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET}`,
    },
  })

  if (!res.ok) throw new Error('Unauthorized: Failed to fetch JSON')

  const data = await res.json()
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
        <Scene
          jsonData={jsonData}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}
          eventPrefix='client'
        />
      </Suspense>
    </>
  )
}
