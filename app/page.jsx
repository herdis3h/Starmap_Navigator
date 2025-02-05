'use client'

import { useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

export default function Page() {
  const ref = useRef()
  return (
    <>
      <Suspense
        fallback={
          <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>Loading...</div>
        }
      >
        <Scene
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}
          eventSource={ref}
          eventPrefix='client'
        />
      </Suspense>
    </>
  )
}
