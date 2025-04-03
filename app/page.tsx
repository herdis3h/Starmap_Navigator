// app/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import path from 'path'
import { promises as fs } from 'fs'
import { StarSystem } from '@/types/InterstellarData'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

async function fetch3DData(): Promise<StarSystem[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'interstellar_destinations.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)
  return data
}

export default async function Page() {
  const jsonData = await fetch3DData()

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
