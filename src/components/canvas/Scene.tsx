'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls } from '@react-three/drei'
import Planet from './Planet'

export default function Scene({ jsonData }: { jsonData: any }) {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [3, 2, 15],
      }}
      gl={{ antialias: false }}
    >
      <color args={['#000000']} attach='background' />
      <Center>
        <Planet interstellarData={jsonData} />
      </Center>
      <OrbitControls />
    </Canvas>
  )
}
