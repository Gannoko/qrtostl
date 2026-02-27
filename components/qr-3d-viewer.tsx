'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

interface QR3DViewerProps {
  heightMap: number[][] | null
  qrSize: number
  qrHeight: number
  baseHeight: number
}

function QRMesh({ heightMap, qrSize, qrHeight, baseHeight }: Required<QR3DViewerProps>) {
  const meshRef = useRef<THREE.Mesh>(null)

  const { baseGeometry, qrGeometry } = useMemo(() => {
    if (!heightMap) return { baseGeometry: null, qrGeometry: null }

    const resolution = heightMap.length
    const scale = qrSize / resolution

    // GEOMETRÍA DE LA BASE BLANCA
    const baseVertices: number[] = []
    const baseIndices: number[] = []

    // Vértices de la base (cara superior de la base)
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const xPos = x * scale - qrSize / 2
        const yPos = y * scale - qrSize / 2
        baseVertices.push(xPos, baseHeight, yPos)
      }
    }

    // Vértices de la parte inferior de la base
    const baseBottomOffset = baseVertices.length / 3
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const xPos = x * scale - qrSize / 2
        const yPos = y * scale - qrSize / 2
        baseVertices.push(xPos, 0, yPos)
      }
    }

    // Cara superior de la base
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const i = y * (resolution + 1) + x
        baseIndices.push(i, i + 1, i + resolution + 1)
        baseIndices.push(i + 1, i + resolution + 2, i + resolution + 1)
      }
    }

    // Cara inferior de la base
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const i = baseBottomOffset + y * (resolution + 1) + x
        baseIndices.push(i, i + resolution + 1, i + 1)
        baseIndices.push(i + 1, i + resolution + 1, i + resolution + 2)
      }
    }

    // Paredes laterales de la base
    // Pared frontal
    for (let x = 0; x < resolution; x++) {
      const topLeft = x
      const topRight = x + 1
      const bottomLeft = baseBottomOffset + x
      const bottomRight = baseBottomOffset + x + 1
      baseIndices.push(topLeft, bottomLeft, topRight)
      baseIndices.push(topRight, bottomLeft, bottomRight)
    }

    // Pared trasera
    for (let x = 0; x < resolution; x++) {
      const topLeft = resolution * (resolution + 1) + x
      const topRight = resolution * (resolution + 1) + x + 1
      const bottomLeft = baseBottomOffset + resolution * (resolution + 1) + x
      const bottomRight = baseBottomOffset + resolution * (resolution + 1) + x + 1
      baseIndices.push(topLeft, topRight, bottomLeft)
      baseIndices.push(topRight, bottomRight, bottomLeft)
    }

    // Pared izquierda
    for (let y = 0; y < resolution; y++) {
      const topLeft = y * (resolution + 1)
      const topRight = (y + 1) * (resolution + 1)
      const bottomLeft = baseBottomOffset + y * (resolution + 1)
      const bottomRight = baseBottomOffset + (y + 1) * (resolution + 1)
      baseIndices.push(topLeft, topRight, bottomLeft)
      baseIndices.push(topRight, bottomRight, bottomLeft)
    }

    // Pared derecha
    for (let y = 0; y < resolution; y++) {
      const topLeft = y * (resolution + 1) + resolution
      const topRight = (y + 1) * (resolution + 1) + resolution
      const bottomLeft = baseBottomOffset + y * (resolution + 1) + resolution
      const bottomRight = baseBottomOffset + (y + 1) * (resolution + 1) + resolution
      baseIndices.push(topLeft, bottomLeft, topRight)
      baseIndices.push(topRight, bottomLeft, bottomRight)
    }

    const baseGeo = new THREE.BufferGeometry()
    baseGeo.setAttribute('position', new THREE.Float32BufferAttribute(baseVertices, 3))
    baseGeo.setIndex(baseIndices)
    baseGeo.computeVertexNormals()

    // GEOMETRÍA DEL QR NEGRO
    const qrVertices: number[] = []
    const qrIndices: number[] = []

    // Solo crear geometría para píxeles negros (QR)
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        if (heightMap[y][x] > 0) {
          // Este píxel es negro (parte del QR)
          const x1 = x * scale - qrSize / 2
          const x2 = (x + 1) * scale - qrSize / 2
          const y1 = y * scale - qrSize / 2
          const y2 = (y + 1) * scale - qrSize / 2
          const z1 = baseHeight
          const z2 = baseHeight + heightMap[y][x]

          const baseIdx = qrVertices.length / 3

          // Cara superior
          qrVertices.push(x1, z2, y1, x2, z2, y1, x2, z2, y2, x1, z2, y2)
          qrIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3)

          // Cara frontal (y = y1)
          qrVertices.push(x1, z1, y1, x2, z1, y1, x2, z2, y1, x1, z2, y1)
          qrIndices.push(
            baseIdx + 4,
            baseIdx + 5,
            baseIdx + 6,
            baseIdx + 4,
            baseIdx + 6,
            baseIdx + 7
          )

          // Cara trasera (y = y2)
          qrVertices.push(x1, z1, y2, x1, z2, y2, x2, z2, y2, x2, z1, y2)
          qrIndices.push(
            baseIdx + 8,
            baseIdx + 9,
            baseIdx + 10,
            baseIdx + 8,
            baseIdx + 10,
            baseIdx + 11
          )

          // Cara izquierda (x = x1)
          qrVertices.push(x1, z1, y1, x1, z2, y1, x1, z2, y2, x1, z1, y2)
          qrIndices.push(
            baseIdx + 12,
            baseIdx + 13,
            baseIdx + 14,
            baseIdx + 12,
            baseIdx + 14,
            baseIdx + 15
          )

          // Cara derecha (x = x2)
          qrVertices.push(x2, z1, y1, x2, z1, y2, x2, z2, y2, x2, z2, y1)
          qrIndices.push(
            baseIdx + 16,
            baseIdx + 17,
            baseIdx + 18,
            baseIdx + 16,
            baseIdx + 18,
            baseIdx + 19
          )
        }
      }
    }

    const qrGeo = new THREE.BufferGeometry()
    qrGeo.setAttribute('position', new THREE.Float32BufferAttribute(qrVertices, 3))
    qrGeo.setIndex(qrIndices)
    qrGeo.computeVertexNormals()

    return { baseGeometry: baseGeo, qrGeometry: qrGeo }
  }, [heightMap, qrSize, qrHeight, baseHeight])

  if (!baseGeometry || !qrGeometry) return null

  return (
    <group ref={meshRef}>
      {/* Base blanca */}
      <mesh geometry={baseGeometry}>
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.6} />
      </mesh>
      {/* QR negro */}
      <mesh geometry={qrGeometry}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function QR3DViewer({ heightMap, qrSize, qrHeight, baseHeight }: QR3DViewerProps) {
  if (!heightMap) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{'Sin vista previa 3D'}</p>
          <p className="text-xs">{'Genera un QR para ver el modelo 3D'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border-2 border-border bg-gradient-to-br from-slate-50 to-slate-100/50" style={{ minHeight: '500px' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ 
          position: [qrSize * 0.8, qrSize * 0.8, qrSize * 0.8], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#f8fafc']} />
        
        {/* Iluminación mejorada */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[qrSize, qrSize * 1.5, qrSize]} 
          intensity={1.2} 
          castShadow 
        />
        <directionalLight 
          position={[-qrSize * 0.5, qrSize * 0.5, -qrSize * 0.5]} 
          intensity={0.4} 
        />
        <pointLight position={[0, qrSize * 2, 0]} intensity={0.3} />
        
        <QRMesh
          heightMap={heightMap}
          qrSize={qrSize}
          qrHeight={qrHeight}
          baseHeight={baseHeight}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={qrSize * 0.5}
          maxDistance={qrSize * 3}
          target={[0, (baseHeight + qrHeight) / 2, 0]}
          maxPolarAngle={Math.PI * 0.9}
          minPolarAngle={Math.PI * 0.1}
        />
        
        <Environment preset="apartment" />
        
        {/* Grid helper ajustado */}
        <gridHelper 
          args={[qrSize * 3, 20, '#cbd5e1', '#e2e8f0']} 
          position={[0, -0.01, 0]} 
        />
      </Canvas>
    </div>
  )
}
