import {useState, useRef, useEffect} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {FlyControls} from 'three/addons/controls/FlyControls.js';
import gsap from 'gsap'

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
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.set(1, 1, 1)
        camera.lookAt(0, 0, 0)

        // 渲染器设置
        const renderer = new THREE.WebGLRenderer({antialias: true})
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        // renderer.shadowMap.enabled = true // 开启阴影
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap // 设置阴影类型
        mountRef.current.appendChild(renderer.domElement)


        // const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}))
        // scene.add(box)
        // box.position.set(0, 1.2, 0)


        const controls = new OrbitControls(camera, renderer.domElement);
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


        const cardItemObj = {}
        const gltfloader = new GLTFLoader()
        //  gltfloader.setDRACOLoader(dracoLoader)
        let ground;
        gltfloader.load(
            '/assets/model/xiaomi.glb',
            (gltf) => {
                const car = gltf.scene
                car.position.set(0, 0, 0)
                car.traverse((child) => {
                    // if (child.isMesh) {
                    //   child.castShadow = true
                    //   child.receiveShadow = true
                    //   // 添加到可点击对象数组
                    //   clickableObjects.push(child)
                    // }
                    cardItemObj[child.name] = child
                    console.log("cardItemObj[child.name]",cardItemObj[child.name])

                    if (child.name === "ground") {

                        // 确保材质支持环境贴图
                        if (child.material) {
                            child.material = new THREE.MeshStandardMaterial({
                                ...child.material,
                                envMap: cubeRenderTarget.texture,
                                envMapIntensity: 0.8,  // 增加环境贴图强度
                                metalness: 0.9,        // 调整金属度
                                roughness: 0,        // 调整粗糙度
                                side: THREE.DoubleSide
                            });
                            child.material.needsUpdate = true;
                            ground = child;
                        }
                    }
                    if (child.name == "ground_shadow") {
                        child.material.side = THREE.DoubleSide
                        child.material.map.anisotropy = 8 // 设置抗锯齿
                    }

                    if (child.name == "su7") {
                        console.log(child);
                        child.traverse((item) => {
                            if (item.type == "Mesh") {
                                item.material.envMapIntensity = 10 // 设置环境贴图强度
                            }
                        })
                    }

                    if (child.name == "ground_shader") {
                        child.material.map.anisotropy = 8 // 设置抗锯齿
                    }

                    if (child.name == "flyline") {  // 控制流光
                        child.material.map.anisotropy = 8
                        child.material.opacity = 0
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


        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(2048);

        const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)
        scene.add(cubeCamera)

        // 添加一些光源来增强反射效果
        // const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        // scene.add(ambientLight)

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        // directionalLight.position.set(5, 5, 5)
        // scene.add(directionalLight)

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

            // 更新控制器
            controls.update()

            // 更新 cubeCamera
            if (ground) {
                ground.visible = false  // 临时隐藏地面以避免自反射
                cubeCamera.position.copy(camera.position)
                cubeCamera.position.y = -cubeCamera.position.y
                cubeCamera.update(renderer, scene)
                ground.visible = true   // 恢复地面可见性
            }

            renderer.render(scene, camera)
            requestAnimationFrame(animate)
        }

        animate()

        // 处理窗口大小调整
        function handleResize() {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener('resize', handleResize)

        window.addEventListener('mousedown', () => {

            gsap.to(camera, {
                fov: 95,
                duration: 0.5,
                repeat: 0,
                ease: 'power1.inOut',
                onUpdate: () => {
                    camera.updateProjectionMatrix()
                }
            })


            console.log("cardItemObj",cardItemObj['flyline'])
            // console.log("luntaiqian",luntaiqian)


            const flyline = cardItemObj['flyline']

            flyline.userData['flylineTwen'] =
                gsap.to(flyline.material.map.offset, {
                    x: flyline.material.map.offset.x - 1,
                    duration: 1,// 时间
                    ease: "none", // 缓动
                    repeat: -1 // 重复
                })  // 管理动画
            flyline.userData['flylineOpacityTwen'] =
                gsap.to(flyline.material, {
                    opacity: 1,
                    duration: 0.4,// 时间
                    ease: "none", // 缓动
                    repeat: 0 // 重复
                }) // 管理动画
            const groundShader = cardItemObj['ground_shader']
            groundShader.userData['groundShaderTwen'] =
                gsap.to(groundShader.material.map.offset, {
                    y:groundShader.material.map.offset.y-1,
                    duration: 0.6,// 时间
                    ease: "none", // 缓动
                    repeat: -1 // 重复
                })

            const luntaiqian = cardItemObj['luntaiqian']

            const luntaihou = cardItemObj['luntaihou']
            luntaiqian.userData['luntaiqianTwen'] =
                gsap.to(luntaiqian.rotation, {
                    x: luntaiqian.rotation.x-2 * Math.PI,
                    duration: 0.4,// 时间
                    ease: "none", // 缓动
                    repeat: -1 // 重复
                })
            luntaihou.userData['luntaihouTwen'] =
                gsap.to(luntaihou.rotation, {
                    x: luntaihou.rotation.x-2 * Math.PI,
                    duration: 0.4,// 时间
                    ease: "none", // 缓动
                    repeat: -1 // 重复
                })

        })

        window.addEventListener('mouseup', () => {
            gsap.to(camera, {
                fov: 75,
                duration: 0.5,
                repeat: 0,
                ease: 'power1.inOut',
                onUpdate: () => {
                    camera.updateProjectionMatrix()
                }
            })
            cardItemObj['flyline'].userData['flylineTwen'].kill() // 立即停止并销毁这个动画
            cardItemObj['ground_shader'].userData['groundShaderTwen'].kill() // 立即停止并销毁这个动画
            cardItemObj['luntaiqian'].userData['luntaiqianTwen'].kill() // 立即停止并销毁这个动画
            cardItemObj['luntaihou'].userData['luntaihouTwen'].kill() // 立即停止并销毁这个动画


            gsap.to(cardItemObj['flyline'].material, {
                opacity: 0,
                duration: 0.4,// 时间
                ease: "none", // 缓动
                repeat: 0, // 重复
                onComplete:()=> cardItemObj['flyline'].userData['flylineOpacityTwen'].kill()
            })



        })


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
            <div ref={mountRef} className="absolute inset-0 z-0"/>
            {/* 底部信息 */}

        </div>
    )
}

export default App
