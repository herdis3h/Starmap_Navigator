'use client'


import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls } from '@react-three/drei'
import Planet from './Planet'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

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
        <Planet  interstellarData={jsonData} />
      </Center>
      <OrbitControls />
      {/* <ambientLight intensity={1.0} />
      <pointLight position={[10, 10, 10]} /> */}
      {/* <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.5} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer> */}
    </Canvas>
  )
}
