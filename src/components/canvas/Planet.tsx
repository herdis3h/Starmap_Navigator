import React, { useRef, useMemo, useState, useEffect } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial, Sparkles, Text, Line } from '@react-three/drei'
import {
  Mesh,
  Color,
  Vector2,
  Vector3,
  DoubleSide,
  AdditiveBlending,
  ShaderMaterial as ShaderMaterialType,
} from 'three'

interface SparkleLineShaderMaterialType extends ShaderMaterialType {
  uTime: number
  uColor: Vector3
  uResolution: Vector2
}

const SparkleLineShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color(),
    uResolution: new Vector2(),
  },
  `
    precision highp float;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec3 uColor;

    void main() {
       vec4 modelPosition = modelMatrix * vec4(position, 1.0);
       vec4 viewPosition = viewMatrix * modelPosition;
       vec4 projectionPosition = projectionMatrix * viewPosition;

       gl_Position = projectionPosition;
       vUv = uv;
       vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
       vPosition = modelPosition.xyz;
       vNormal = modelNormal.xyz;
    }
  `,
  `
    precision highp float;
    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform float uTime;
    uniform vec3 uColor;

    void main() {
      vec3 normal = normalize(vNormal);
      if(!gl_FrontFacing) normal *= -1.0;

      float stripes = mod((vPosition.y - uTime * 0.02) * 30.0, 1.0);
      stripes = pow(stripes, 3.0);

      vec3 viewDir = normalize(vPosition - cameraPosition);
      float fresenl = dot(viewDir, normal) + 1.0;
      fresenl = pow(fresenl, 2.0);
      float falloff = smoothstep(0.8, 0.0, fresenl);

      float holo = stripes * fresenl;
      holo += fresenl * 1.22;
      holo *= falloff;

      gl_FragColor = vec4(uColor, holo);
    }
  `,
) as unknown as new () => SparkleLineShaderMaterialType

extend({ SparkleLineShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    sparkleLineShaderMaterial: React.JSX.IntrinsicElements['mesh'] & {
      ref?: React.Ref<SparkleLineShaderMaterialType>
      uTime?: number
      uColor?: Color
      uResolution?: Vector2
    }
  }
}

const galaxyColors = [
  '#ffdd55',
  '#ff7733',
  '#ff5500',
  '#ffcc00',
  '#ff6600',
  '#99ccff',
  '#5ef1f2',
  '#d8ebf2',
  '#3a7bd5',
  '#ff8c42',
  '#2a9d8f',
  '#c0c0c0',
  '#ff4500',
  '#663399',
  '#9acd32',
  '#ffdd55',
  '#ffcc00',
  '#ff7733',
  '#ff4500',
  '#ff0000',
  '#ffd700',
  '#ff6600',
  '#99ccff',
  '#5ef1f2',
  '#d8ebf2',
  '#3a7bd5',
  '#ffffff',
  '#f0f8ff',
  '#b0c4de',
  '#c0c0c0',
]

export default function Planet({ interstellarData }: { interstellarData: any }) {
  const [positions] = useState(() => {
    return interstellarData.map((system) => ({
      position: system.coordinates,
      name: system.star_system,
      color: new Color(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]),
      planets: system.planets.map((planet, i) => ({
        ...planet,
        index: i,
        sparkleColor: new Color(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]),
      })),
    }))
  })

  return (
    <group position={[0, 0, 0]} dispose={null}>
      <Sparkles count={300} scale={20} size={6} speed={0.4} />
      {positions.map((star, index: number) => (
        <group key={index}>
          <Star
            color={star.color}
            planets={star.planets}
            name={star.name}
            position={star.position}
            rotationSpeed={0.4}
          />
          {index < positions.length - 1 && (
            <Line
              points={[
                [star.position[0], star.position[1], star.position[2]],
                [positions[index + 1].position[0], positions[index + 1].position[1], positions[index + 1].position[2]],
              ]}
              color={star.color}
              linewidth={1}
              opacity={1}
              transparent
            />
          )}
        </group>
      ))}
    </group>
  )
}

function Star({ planets, name, position, rotationSpeed, color }) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<SparkleLineShaderMaterialType>(null)

  const sparklePosition = useMemo(() => {
    if (!meshRef.current) return position
    const worldPos = new Vector3()
    meshRef.current.getWorldPosition(worldPos)
    return [worldPos.x, worldPos.y, worldPos.z]
  }, [position])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.uTime = elapsed
      materialRef.current.uColor = color
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(elapsed * rotationSpeed)
      meshRef.current.rotation.x = Math.cos(elapsed * rotationSpeed * 0.8)
    }
  })

  return (
    <>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <sparkleLineShaderMaterial
          ref={materialRef}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          transparent={true}
        />
      </mesh>

      <Text position={[position[0] + 0.5, position[1] + 0.5, position[2]]} fontSize={0.3} color='white'>
        {name}
      </Text>

      {planets.map((planet, i) => (
        <Sparkles
          key={planet.name + i}
          count={1}
          color={planet.color}
          scale={0.5}
          size={24}
          position={sparklePosition}
          speed={0.5}
          opacity={0.9}
        />
      ))}
    </>
  )
}
