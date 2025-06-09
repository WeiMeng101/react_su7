import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  Environment,
  Float,
  Text3D,
  Center,
  useGLTF,
  Stage,
  Stars,
  Cloud,
  Sky
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, Suspense } from 'react'
import * as THREE from 'three'

// 粒子系统组件
function ParticleSystem() {
  const particlesRef = useRef()
  const count = 1000
  
  // 创建随机位置
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#fbbf24" />
    </points>
  )
}

// 动画的环形几何体
function AnimatedTorus() {
  const meshRef = useRef()
  const [scale, setScale] = useState(1)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh
      ref={meshRef}
      scale={scale}
      onPointerOver={() => setScale(1.2)}
      onPointerOut={() => setScale(1)}
    >
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshNormalMaterial />
    </mesh>
  )
}

// 主场景组件
export default function AdvancedThreeScene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        
        {/* 灯光设置 */}
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        
        <Suspense fallback={null}>
          {/* 天空背景 */}
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
          />
          
          {/* 星空 */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          
          {/* 云朵 */}
          <Cloud
            position={[-4, -2, -25]}
            speed={0.2}
            opacity={0.5}
            scale={2}
          />
          
          {/* 悬浮动画 */}
          <Float
            speed={2}
            rotationIntensity={1}
            floatIntensity={2}
          >
            <AnimatedTorus />
          </Float>
          
          {/* 粒子系统 */}
          <ParticleSystem />
          
          {/* 3D 文字 */}
          <Center position={[0, 3, 0]}>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.5}
              height={0.2}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
            >
              THREE.JS
              <meshStandardMaterial color="#60a5fa" />
            </Text3D>
          </Center>
        </Suspense>
        
        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI 覆盖层 */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-2xl font-bold mb-2">高级 Three.js 场景</h2>
        <p className="text-sm opacity-75">
          • 粒子系统<br />
          • 动画几何体<br />
          • 天空和星空<br />
          • 悬浮效果<br />
          • 鼠标交互
        </p>
      </div>
    </div>
  )
} 