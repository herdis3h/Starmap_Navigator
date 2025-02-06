'use client'

import React from 'react'
import { StarSystem } from '@/types/InterstellarData'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls } from '@react-three/drei'
import Planet from './Planet'

export default function Scene({ jsonData }: { jsonData: StarSystem[] }) {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [3, 2, 15],
      }}
      gl={{ antialias: true }}
    >
      <color args={['#000000']} attach='background' />
      <Center>
        <Planet interstellarData={jsonData} />
      </Center>
      <OrbitControls enableDamping />
    </Canvas>
  )
}
