// Background.js
import React, { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import BackgroundShaderMaterial from './BackgroundShader'
import { useControls } from 'leva'
import * as THREE from 'three'

// Extend so that our material is available as a JSX element.
extend({ BackgroundShaderMaterial })

export default function Background() {
  const { viewport } = useThree()
  // Leva controls to adjust noise parameters
  const { noiseScaleX, noiseScaleY, noiseSpeedX, noiseSpeedY } = useControls({
    noiseScaleX: { value: 10.0, min: 0.1, max: 10, step: 0.1 },
    noiseScaleY: { value: 8.8, min: 0.1, max: 10, step: 0.1 },
    noiseSpeedX: { value: 0.37, min: 0, max: 2, step: 0.01 },
    noiseSpeedY: { value: 0.1, min: 0, max: 2, step: 0.01 },
  })

  const materialRef = useRef()

  useFrame(({ clock, size }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
      materialRef.current.uResolution.set(size.width, size.height)
      // Update noise uniforms from Leva controls
      materialRef.current.uNoiseScale.set(noiseScaleX, noiseScaleY)
      materialRef.current.uNoiseSpeed.set(noiseSpeedX, noiseSpeedY)
    }
  })

  return (
    <Plane args={[viewport.width, viewport.height]} position={[0, 0, -2]}>
      <backgroundShaderMaterial
        ref={materialRef}
        attach='material'
        uTime={0}
        uResolution={new THREE.Vector2(1, 1)}
        uNoiseScale={new THREE.Vector2(3.0, 3.0)}
        uNoiseSpeed={new THREE.Vector2(0.1, 0.1)}
      />
    </Plane>
  )
}
