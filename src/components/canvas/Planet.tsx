import React, { useRef, useMemo, useState } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { Html, shaderMaterial, Sparkles, Text, Line } from '@react-three/drei'
import {
  Mesh,
  Color,
  Vector2,
  Vector3,
  DoubleSide,
  AdditiveBlending,
  ShaderMaterial as ShaderMaterialType,
} from 'three'
import { useSpring, animated } from '@react-spring/three'
import { useSpring as useSpringWeb, animated as animatedWeb } from '@react-spring/web'
import { StarSystem, PlanetData } from '@/types/InterstellarData'

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

export default function Planet({ interstellarData }: { interstellarData: StarSystem[] }) {
  type StarData = {
    position: [number, number, number]
    name: string
    color: Color
    planets: {
      index: number
      sparkleColor: Color
      name: string
      description: string
      image_url?: string
      color: string
    }[]
  }

  const [selectedStar, setSelectedStar] = useState<StarData | null>(null)

  const handleStarClick = (star: StarData) => {
    setSelectedStar((prev) => (prev === star ? null : star))
  }

  const [positions] = useState(() => {
    return interstellarData.map((system) => ({
      position: system.coordinates,
      name: system.star_system,
      color: new Color(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]),
      planets: system.planets.map((planet: PlanetData, i: number) => ({
        ...planet,
        index: i,
        sparkleColor: new Color(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]),
      })),
    }))
  })

  const infoBoxAnimation = useSpringWeb({
    opacity: selectedStar ? 1 : 0,
    transform: selectedStar ? 'scale(1)' : 'scale(0.8)',
    config: { tension: 170, friction: 12 },
  })

  const sparklesAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 2000 },
  })

  return (
    <group position={[0, 0, 0]} dispose={null}>
      <animated.group style={sparklesAnimation}>
        <Sparkles count={300} scale={20} size={6} speed={0.4} />
      </animated.group>
      {positions.map((star, index: number) => (
        <group key={index}>
          <Star
            onClick={() => handleStarClick(star)}
            color={star.color}
            planets={star.planets}
            name={star.name}
            position={star.position}
            rotationSpeed={0.4}
            isSelected={selectedStar === star}
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
          {selectedStar === star && (
            <Html position={[star.position[0] + 1, star.position[1], star.position[2]]}>
              <animatedWeb.div
                style={{
                  ...infoBoxAnimation,
                  background: 'rgba(10, 20, 53, 0.87)',
                  color: 'white',
                  padding: '10px',
                  border: '2px solid #00389c',
                  borderRadius: '8px',
                  width: '370px',
                  fontSize: '14px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <strong style={{ fontSize: '16px', display: 'block' }}>{star.name}</strong>
                  <button
                    onClick={() => setSelectedStar(null)}
                    style={{
                      marginTop: '5px',
                      cursor: 'pointer',
                      background: '#00389c',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    X
                  </button>
                </div>
                <p
                  style={{
                    marginBottom: '10px',
                  }}
                >
                  Within this system contains these planets:
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  {selectedStar.planets.map((planet: PlanetData) => {
                    return (
                      <li style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} key={planet.name}>
                        <strong
                          style={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {' '}
                          {planet.name}
                        </strong>
                        <p>{planet.description}</p>
                      </li>
                    )
                  })}
                </ul>
              </animatedWeb.div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}

function Star({ planets, name, position, rotationSpeed, color, onClick, isSelected }) {
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

  const { scale } = useSpring({
    scale: isSelected ? 1.5 : 1,
    config: { mass: 1, tension: 170, friction: 12 },
  })

  return (
    <>
      <animated.mesh ref={meshRef} scale={scale} position={position} onClick={onClick}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <sparkleLineShaderMaterial
          ref={materialRef}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          transparent={true}
        />
      </animated.mesh>

      <Text position={[position[0] + 0.5, position[1] + 0.5, position[2]]} fontSize={0.3} color='white'>
        {name}
      </Text>

      {planets.map((planet, i) => (
        <Sparkles
          key={planet.name + i}
          count={1}
          color={planet.color}
          scale={0.2}
          size={80}
          position={sparklePosition}
          speed={0.7}
          opacity={0.9}
        />
      ))}
    </>
  )
}
