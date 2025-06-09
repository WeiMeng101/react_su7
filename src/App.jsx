import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { log } from 'three/tsl'
import { FlyControls } from 'three/addons/controls/FlyControls.js';

function App() {
  const mountRef = useRef(null)
  const initRef = useRef(false)  // 添加初始化标记
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    if (!mountRef.current || initRef.current) return  // 检查是否已经初始化
    initRef.current = true  // 标记为已初始化
    console.log("初始化");
    

    // 场景设置
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x222222)

    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(3, 3, 3)
    camera.lookAt(0, 0, 0)

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)


    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}))
    scene.add(box)
    box.position.set(0, 1.2, 0)




    const controls = new OrbitControls( camera, renderer.domElement );
      // 灯光
      // const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      // scene.add(ambientLight)

      // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      // directionalLight.position.set(10, 10, 5)
      // directionalLight.castShadow = true
      // directionalLight.shadow.camera.near = 0.1
      // directionalLight.shadow.camera.far = 50
      // directionalLight.shadow.camera.left = -10
      // directionalLight.shadow.camera.right = 10
      // directionalLight.shadow.camera.top = 10
      // directionalLight.shadow.camera.bottom = -10
      // scene.add(directionalLight)

      // // 添加地面
      // const groundGeometry = new THREE.PlaneGeometry(20, 20)
      // const groundMaterial = new THREE.MeshStandardMaterial({ 
      //   color: 0x444444,
      //   roughness: 0.8
      // })
      // const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      // ground.rotation.x = -Math.PI / 2
      // ground.position.y = -0.5
      // ground.receiveShadow = true
      // scene.add(ground)

         // 存储可点击的对象
     const clickableObjects = []


     // GLTF 加载器 - 设置 DRACOLoader
    //  const dracoLoader = new DRACOLoader()
    //  dracoLoader.setDecoderPath('./assets/draco/')
    //  dracoLoader.setDecoderConfig({ type: 'js' })




    // 加入控制
    // const axesHelper = new THREE.AxesHelper(10)
    // scene.add(axesHelper)

     
     const gltfloader = new GLTFLoader()
    //  gltfloader.setDRACOLoader(dracoLoader)
     
     gltfloader.load(
      '/assets/model/xiaomi.glb', 
      (gltf) => {
        const car = gltf.scene
        console.log("car",car);
        car.position.set(0, 0, 0)
        car.traverse((child) => {
          // if (child.isMesh) {
          //   child.castShadow = true
          //   child.receiveShadow = true
          //   // 添加到可点击对象数组
          //   clickableObjects.push(child)
          // }
         
          if(child.type == "Mesh"){
            // 确保材质支持环境贴图
            if (child.material) {
              child.material = new THREE.MeshStandardMaterial({
                ...child.material,
                envMap: cubeRenderTarget.texture,
                envMapIntensity: 1.0,
                metalness: 0.9,
                roughness: 0.1
              });
              child.material.needsUpdate = true;
            }
            child.material.side = THREE.DoubleSide
            child.visible = true
          }
          if(child.type == "Object3D"){  
            child.visible = false
          }
        })
        car.scale.set(0.1, 0.1, 0.1)
        scene.add(car)
      }
    )
  
     const hdrloader = new RGBELoader()
     hdrloader.setPath('/assets/model/') // 设置基础路径
     hdrloader.load(
      'sky.hdr', 
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture
        scene.environment = texture
      }
    )

    // const light = new THREE.DirectionalLight(0xffffff, 2)
    // light.position.set(10, 10, 10)
    // scene.add(light)


    
    const cubeRenderTarget =  new THREE.WebGLCubeRenderTarget(1024);
    const cubeCamera = new THREE.CubeCamera(0.01, 100, cubeRenderTarget)
    // 控制器设置 - 暂时禁用 OrbitControls，使用手动控制
    

    // Raycaster 用于点击检测
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // 点击事件处理
    function handleClick(event) {
      setClickCount(prev => prev + 1)

      // 计算鼠标位置
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // 射线检测
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(clickableObjects)

      if (intersects.length > 0) {
        const object = intersects[0].object
        // 随机改变颜色
        if (object.material && object.material.color) {
          object.material.color.setHex(Math.random() * 0xffffff)
        }
      }
    }

    // 添加事件监听
    renderer.domElement.addEventListener('click', handleClick)
  
    
    // 动画循环
    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)

      // 更新控制器
      controls.update() // 暂时禁用
      cubeCamera.position.copy(camera.position)
      cubeCamera.update(renderer, scene)
    }

    animate()

    // 处理窗口大小调整
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      
      // 清理 Three.js 资源
      // controls.dispose() // 暂时禁用
      renderer.dispose()
      
      // 使用局部变量避免 ref 值改变的问题
      const currentMount = mountRef.current
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement)
      }
    } 
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Three.js 画布容器 */}
      <div ref={mountRef} className="absolute inset-0 z-0" />
      
      {/* UI 覆盖层 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm pointer-events-none z-10">
        <h1 className="text-2xl font-bold text-white mb-2">
          Three.js + React + Tailwind
        </h1>
        <p className="text-gray-300 text-sm">
          左键拖动旋转 | 滚轮缩放 | 右键平移 | 点击物体改变颜色
        </p>
        <p className="text-white mt-2">
          点击次数: {clickCount}
        </p>
      </div>
      
      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm text-white text-sm pointer-events-none z-10">
        <p>使用 OrbitControls 控制相机，点击立方体、球体或圆锥体改变颜色</p>
      </div>
    </div>
  )
}

export default App
