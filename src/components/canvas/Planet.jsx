import React, { useRef, useMemo, useState } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, OrbitControls, Sparkles, Text, Points, Point, PointMaterial } from '@react-three/drei'
import { useControls } from 'leva'
import { Color, Vector2, Vector3, DoubleSide, AdditiveBlending } from 'three'

import interstellarData from './interstellar_destinations.json'

const SparkleLineShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color('red'),
    uResolution: new Vector2(),
    isStar: false,
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
    uniform bool isStar;
    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform float uTime;
    uniform vec3 uColor;

    void main() {

      vec3 normal = normalize(vNormal);

      if(!gl_FrontFacing)
        normal *=  - 1.0;

      float stripes = mod( (vPosition.y - uTime * 0.02) * 30.0, 1.0);
      stripes = pow(stripes, 3.0);

      // Fresenl
      vec3 viewDir = normalize(vPosition - cameraPosition);
      float fresenl = dot(viewDir, normal) + 1.0;
      fresenl = pow(fresenl, 2.0);

      // falloff
      float falloff = smoothstep(0.8, 0.0, fresenl);

      // Holograph
      float holo = stripes * fresenl;
      holo += fresenl * 1.22;
      holo *= falloff;

      gl_FragColor = vec4(uColor, holo);
    }
  `,
)
extend({ SparkleLineShaderMaterial })

export default function Planet() {
  const { size } = useThree()
  const starMaterialRef = useRef()
  const planetMaterialRef = useRef()

  // ✅ Leva Controls for dynamic size adjustment
  const { planetSize, starSize } = useControls({
    planetSize: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    starSize: { value: 1.0, min: 0.5, max: 3, step: 0.1 },
  })

  // ✅ Store star & planet positions
  const [positions] = useState(() => {
    const stars = []
    const planets = []
    const labels = []
    const planetLabels = []

    interstellarData.forEach((system) => {
      const [sx, sy, sz] = system.coordinates
      stars.push({
        position: [sx, sy, sz],
        name: system.star_system,
        color: new Color(system.color),
        planets: system.planets,
      })

      // system.planets.forEach((planet) => {
      //   const [px, py, pz] = planet.coordinates
      //   planetLabels.push({
      //     name: planet.name,
      //     position: [px + 0.2, py, pz],
      //   })
      // })
    })

    return { stars, planets, labels, planetLabels }
  })

  const { stars, planets, planetLabels } = positions

  // ✅ Update shader every frame
  useFrame(({ clock }) => {
    if (starMaterialRef.current) {
      starMaterialRef.current.uTime = clock.getElapsedTime()
      starMaterialRef.current.uResolution.set(size.width, size.height)
    }
    if (planetMaterialRef.current) {
      planetMaterialRef.current.uTime = clock.getElapsedTime()
      planetMaterialRef.current.uResolution.set(size.width, size.height)
    }
  })

  return (
    <group position={[0, 0, 0]} dispose={null}>
      <OrbitControls makeDefault />

      <Sparkles count={300} scale={20} size={6} speed={0.4} />

      {stars.map((star, index) => (
        <Star
          planets={star.planets}
          key={index}
          name={star.name}
          position={star.position}
          rotationSpeed={0.4}
          color={star.color}
          index={index}
        />
      ))}

      {/* {planets.map((planet, index) => (
        <mesh key={index} position={planet.position}>
          <sphereGeometry args={[planetSize, 16, 16]} />
          <meshStandardMaterial wireframe color='green' emissive='green' emissiveIntensity={1.0} />
        </mesh>
      ))} */}

      {/* <Points limit={planets.length}>
        <PointMaterial
          transparent
          vertexColors
          size={20}
          sizeAttenuation={false}
          depthTest={false}
          toneMapped={false}
        />
        {planets.map((position, i) => (
          <PointEvent key={i} index={i} position={position} />
        ))}
      </Points> */}

      {/* {stars.map((star, index) => (
        <Text
          key={index}
          position={[star.position[0] + 0.5, star.position[1], star.position[2]]}
          fontSize={0.3}
          color='white'
        >
          {star.name}
        </Text>
      ))} */}
    </group>
  )
}

// ✅ Star Component with Dynamic Shader Instance
function Star({ planets, name, position, rotationSpeed, color, index }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const { size } = useThree()

  const sparklePosition = useMemo(() => {
    // Reset position from metch
    if (!meshRef.current) return position

    const worldPos = new Vector3()
    meshRef.current.getWorldPosition(worldPos)
    return [worldPos.x, worldPos.y, worldPos.z]
  }, [position])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()

    if (materialRef.current) {
      materialRef.current.uTime = elapsed
      materialRef.current.uColor.set(color)
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
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          ref={materialRef}
          transparent={true}
          isStar={true}
        />
      </mesh>
      <Text key={name} position={[position[0] + 0.5, position[1] + 0.5, position[2]]} fontSize={0.3} color='white'>
        {name}
      </Text>
      <Sparkles
        count={planets.length}
        color={new Color(planets[index]?.color)}
        scale={0.5}
        size={24}
        position={sparklePosition}
        speed={0.5}
        opacity={0.9}
      />
    </>
  )
}
