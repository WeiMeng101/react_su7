import {useState, useRef, useEffect} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {FlyControls} from 'three/addons/controls/FlyControls.js';
import gsap from 'gsap'
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {Vector2} from "three";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";

function App() {
    const mountRef = useRef(null)
    const initRef = useRef(false)  // 添加初始化标记
    const [clickCount, setClickCount] = useState(0)
    // const [modelLoaded, setModelLoaded] = useState(false)
    let modelLoaded = useRef(false)
    // const [userSwitchRef, setUserSwitchRef] = useState(0)
    let userSwitchRef = useRef(0)
    let cardItemObj = useRef(null)
    let camera = useRef(new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    ))
    useEffect(() => {
        if (!mountRef.current || initRef.current) return  // 检查是否已经初始化
        initRef.current = true  // 标记为已初始化
        console.log("初始化");


        // 场景设置
        const scene = new THREE.Scene()

        scene.background = new THREE.Color(0x222222)
        scene.fog = new THREE.FogExp2('#000000', 0.05)

        // 相机设置
        camera.current.position.set(1, 1, 1)
        camera.current.lookAt(0, 0, 0)

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

        const controls = new OrbitControls(camera.current, renderer.domElement);
        controls.maxPolarAngle = 1.3
        controls.minPolarAngle = 0.2
        controls.maxDistance = 2.5
        controls.minDistance = 1.8

        // 存储可点击的对象
        const clickableObjects = []


        const gltfloader = new GLTFLoader()
        //  gltfloader.setDRACOLoader(dracoLoader)
        let ground;
        gltfloader.load(
            '/assets/model/xiaomi.glb',
            (gltf) => {
                const car = gltf.scene
                cardItemObj.current = {}
                car.position.set(0, 0, 0)
                car.traverse((child) => {
                    cardItemObj.current[child.name] = child
                    if (child.type === 'Mesh') {
                        // child.material.envMap = cubeRenderTarget.texture;
                        child.material = new THREE.MeshStandardMaterial({
                            ...child.material,
                            envMap: cubeRenderTarget.texture,
                            envMapIntensity: 5,  // 增加环境贴图强度
                            metalness: 0.6,        // 调整金属度
                            roughness: 0.1,        // 调整粗糙度
                        });
                        // child.visible = false;
                    }

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
                    if (child.name === "ground_shadow") {
                        child.material.side = THREE.DoubleSide
                        child.material.map.anisotropy = 8 // 设置抗锯齿
                    }

                    if (child.name === "su7") {
                        console.log(child);
                        child.traverse((item) => {
                            if (item.type == "Mesh") {
                                item.material.envMapIntensity = 10 // 设置环境贴图强度
                            }
                        })
                    }

                    if (child.name === "ground_shader") {
                        child.material.map.anisotropy = 8 // 设置抗锯齿 // 
                    }

                    if (child.name === "flyline") {  // 控制流光
                        child.material.map.anisotropy = 8
                        child.material.opacity = 0
                    }

                    if (child.name === "scanline") {  // 控制流光
                        gsap.to(child.material.map.offset, {
                            y: child.material.map.offset.y - 1,
                            duration: 15,
                            repeat: -1, // 重复
                            ease: "none", // 缓动
                        })
                        child.visible = false
                        // child.material.map.anisotropy = 8
                        // child.material.opacity = 0
                    }
                    if (child.name === "carsizeMain") {
                        child.visible = false
                    }
                    if (child.name === "wind") {
                        child.visible = false
                    }
                    if (child.name === "carFrame3Main") {
                        child.visible = false
                    }
                })
                modelLoaded.current = true
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


        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
        const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)
        scene.add(cubeCamera)

        let effectComposer;

        function initEffect() {
            effectComposer = new EffectComposer(renderer);
            const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.width, window.height), 0.3, 0.1, 0.1)
            let renderPass = new RenderPass(scene, camera.current);
            effectComposer.addPass(renderPass)
            effectComposer.addPass(unrealBloomPass)
        }

        initEffect()

        // 动画循环
        function animate() {

            // 更新控制器
            controls.update()

            // 更新 cubeCamera
            if (ground) {
                ground.visible = false  // 临时隐藏地面以避免自反射
                cubeCamera.position.copy(camera.current.position)
                cubeCamera.position.y = -cubeCamera.position.y
                cubeCamera.update(renderer, scene)
                ground.visible = true   // 恢复地面可见性
            }

            // renderer.render(scene, camera)
            effectComposer.render()
            requestAnimationFrame(animate)
        }

        animate()

        // 处理窗口大小调整
        const handleResize = () => {
            camera.current.aspect = window.innerWidth / window.innerHeight
            camera.current.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', () => {
            handleResize()
        })



        window.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') {
                return
            }
            startAni()
        })
        window.addEventListener('mouseup', (e) => {
            if (e.target.tagName === 'BUTTON') {
                return
            }
            endAni()
            clearAni()
        })
        window.addEventListener('mousemove', (e) => {
            if (e.target.tagName === 'BUTTON') {
                return
            }
            if (!modelLoaded.current) return;
            if (cardItemObj.current['luntaiqian']) {
                if (cardItemObj.current['luntaiqian'].userData['cameraPositionX']) {
                    cardItemObj.current['luntaiqian'].userData['cameraPositionX'].kill() // 立即停止并销毁这个动画
                }

                if (cardItemObj.current['luntaiqian'].userData['cameraPositionY']) {
                    cardItemObj.current['luntaiqian'].userData['cameraPositionY'].kill() // 立即停止并销毁这个动画
                }
            }
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




    function endAni() {
       if (!modelLoaded.current) return

        gsap.to(camera.current, {
            fov: 75,
            duration: 0.6,
            repeat: 0,
            ease: 'power1.inOut',
            onUpdate: () => {
                camera.current.updateProjectionMatrix()
            }
        })

        if (cardItemObj.current['flyline']) {
            gsap.to(cardItemObj.current['flyline'].material.map.offset, {
                x: cardItemObj.current['flyline'].material.map.offset.x - 0.4,
                duration: 0.8,// 时间
                ease: "power1.out", // 缓动
                repeat: 0, // 重复
            })  // 管理动画

            gsap.to(cardItemObj.current['flyline'].material, {
                opacity: 0,
                duration: 0.8,// 时间
                ease: "power1.out", // 缓动
                repeat: 0, // 重复
            })
        }

        if (cardItemObj.current['ground_shader']) {
            gsap.to(cardItemObj.current['ground_shader'].material.map.offset, {
                y: cardItemObj.current['ground_shader'].material.map.offset.y - 0.4,
                duration: 0.4,// 时间
                ease: "power1.out", // 缓动
                repeat: 0, // 重复
            })
        }

        gsap.to(cardItemObj.current['luntaiqian'].rotation, {
            x: cardItemObj.current['luntaiqian'].rotation.x - Math.PI,
            duration: 0.4,// 时间
            ease: "power1.out", // 缓动
            repeat: 0, // 重复
        })

        gsap.to(cardItemObj.current['luntaihou'].rotation, {
            x: cardItemObj.current['luntaihou'].rotation.x - Math.PI,
            duration: 0.4,// 时间
            ease: "power1.out", // 缓动
            repeat: 0, // 重复
        })

        if (cardItemObj.current['scanline']) {
            gsap.to(cardItemObj.current['scanline'].material, {
                opacity: 0,
                duration: 1,
                repeat: 0,
                ease:"none",
                onComplete:()=>{
                    cardItemObj.current['scanline'].visible = false
                }
            })
        }

        if (userSwitchRef.current===2){
            cardItemObj.current['carFrame3Main'].visible = false
            cardItemObj.current['su7'].visible = true
            cardItemObj.current['luntaiqian'].visible = true

        }
    }

    function startAni() {

        if (!modelLoaded.current) return

        gsap.to(camera.current, {
            fov: 95,
            duration: 0.6,
            repeat: 0,
            ease: 'power1.inOut',
            onUpdate: () => {
                camera.current.updateProjectionMatrix()
            }
        })
        if (cardItemObj.current['ground_shader']) {
            const groundShader = cardItemObj.current['ground_shader']
            groundShader.userData['groundShaderTwen'] =
                gsap.to(groundShader.material.map.offset, {
                    y: groundShader.material.map.offset.y - 0.6,
                    duration: 0.6,// 时间
                    ease: "power1.in", // 缓动
                    repeat: 0, // 重复
                    onComplete: () => {
                        groundShader.userData['groundShadernCompleteTwen'] =
                            gsap.to(groundShader.material.map.offset, {
                                y: groundShader.material.map.offset.y - 1,
                                duration: 0.6,// 时间
                                ease: "none", // 缓动
                                repeat: -1 // 重复
                            })
                    }
                })
        }
        if (cardItemObj.current['luntaiqian']) {
            const luntaiqian = cardItemObj.current['luntaiqian']
            luntaiqian.userData['luntaiqianTwen'] =
                gsap.to(luntaiqian.rotation, {
                    x: luntaiqian.rotation.x - Math.PI,
                    duration: 0.6,// 时间
                    ease: "power1.in", // 缓动
                    repeat: 0, // 重复
                    onComplete: () => {
                        luntaiqian.userData['luntaiqianCompleteTwen'] =
                            gsap.to(luntaiqian.rotation, {
                                x: luntaiqian.rotation.x - 2 * Math.PI,
                                duration: 1,// 时间
                                ease: "none", // 缓动
                                repeat: -1, // 重复
                            })

                        luntaiqian.userData['cameraPositionX'] =
                            gsap.to(camera.current.position, {
                                x: camera.current.position.x + 0.008,
                                repeat: -1,
                                ease: "circ.inOut",
                                duration: 0.2,
                                onUpdate: () => {
                                    camera.current.updateProjectionMatrix()
                                }
                            })
                        luntaiqian.userData['cameraPositionY'] =
                            gsap.to(camera.current.position, {
                                y: camera.current.position.y + 0.01,
                                repeat: -1,
                                ease: "circ.inOut",
                                duration: 0.3,
                            })
                    }
                })
        }
        if (cardItemObj.current['luntaihou']) {
            const luntaihou = cardItemObj.current['luntaihou']
            luntaihou.userData['luntaihouTwen'] =
                gsap.to(luntaihou.rotation, {
                    x: luntaihou.rotation.x - Math.PI,
                    duration: 0.6,// 时间
                    ease: "power1.in", // 缓动
                    repeat: 0, // 重复
                    onComplete: () => {
                        luntaihou.userData['luntaihouCompleteTwen'] =
                            gsap.to(luntaihou.rotation, {
                                x: luntaihou.rotation.x - 2 * Math.PI,
                                duration: 1,// 时间
                                ease: "none", // 缓动
                                repeat: -1, // 重复
                            })
                    }
                })
        }

        if (userSwitchRef.current===0){
            if (cardItemObj.current['flyline']) {
                const flyline = cardItemObj.current['flyline']
                flyline.userData['flylineTwen'] =
                    gsap.to(flyline.material.map.offset, {
                        x: flyline.material.map.offset.x - 0.4,
                        duration: 0.8,// 时间
                        ease: "power1.in", // 缓动
                        repeat: 0, // 重复
                        onComplete: () => {
                            flyline.userData['flylineTwenComplete'] =
                                gsap.to(flyline.material.map.offset, {
                                    x: flyline.material.map.offset.x - 1,
                                    duration: 1,// 时间
                                    ease: "none", // 缓动
                                    repeat: -1, // 重复
                                })  // 管理动画
                        }
                    })  // 管理动画
                flyline.userData['flylineOpacityTwen'] =
                    gsap.to(flyline.material, {
                        opacity: 1,
                        duration: 0.4,// 时间
                        ease: "power1.in", // 缓动
                        repeat: 0 // 重复
                    }) // 管理动画
            }
        }
        if (userSwitchRef.current===1){
            const currentElement = cardItemObj.current['scanline'];
            if (currentElement) {
                currentElement.visible = true
                currentElement.userData["scanlineOpacityTwen"] = gsap.to(currentElement.material, {
                    opacity: 1,
                    duration: 1,
                    repeat: 0,
                    ease:"none"
                })
            }
        }
        if (userSwitchRef.current===2){
            const carFrame3Main = cardItemObj.current['carFrame3Main'];
            if (carFrame3Main) {
                carFrame3Main.visible = true
                carFrame3Main.userData["scanlineOffsetTwen"] = gsap.to(carFrame3Main.material.map.offset, {
                    x: carFrame3Main.material.map.offset.x+1,
                    duration: 2,
                    repeat: -1,
                    ease:"none"
                })
            }
           cardItemObj.current['su7'].visible = false
           cardItemObj.current['luntaiqian'].visible = false
        }
    }

    const switchRunModel = ()=>{
        if (!modelLoaded.current) return

        if (cardItemObj.current['carsizeMain']) {
            cardItemObj.current['carsizeMain'].material.transparent = true
            if (userSwitchRef.current === 1) {
                cardItemObj.current['carsizeMain'].visible = true
                console.log("显示")
                gsap.to(cardItemObj.current['carsizeMain'].material, {
                    opacity: 1,
                    duration: 0.6,
                    repeat: 0,
                    ease:"none"
                })
            } else {
                gsap.to(cardItemObj.current['carsizeMain'].material, {
                    opacity: 0,
                    duration: 0.6,
                    repeat: 0,
                    ease:"none",
                    onComplete: () => {
                        cardItemObj.current['carsizeMain'].visible = false
                    }
                })
            }
        }

        if (cardItemObj.current['scanline']) {

            cardItemObj.current['scanline'].material.transparent = true

            console.log("cardItemObj.current['scanline']",cardItemObj.current['scanline'])
            if (userSwitchRef.current === 1) {
                cardItemObj.current['scanline'].visible = false
                cardItemObj.current['scanline'].opacity = 0
            }else {
                gsap.to(cardItemObj.current['scanline'].material, {
                    opacity: 0,
                    duration: 2,
                    repeat: 0,
                    ease:"none",
                    onComplete: () => {
                        cardItemObj.current['scanline'].visible = false
                    }
                })
            }
        }

        if (cardItemObj.current['wind']) {
            if (userSwitchRef.current === 2) {
                cardItemObj.current['wind'].visible = true
                gsap.to(cardItemObj.current['wind'].material.map.offset, {
                    x: cardItemObj.current['wind'].material.map.offset.x+1,
                    repeat:-1,
                    duration: 2,
                    ease:"none",
                })
            }else {
                cardItemObj.current['wind'].visible = false
            }
        }

    }

    function clearAni() {
        if (!modelLoaded.current) return

        if (cardItemObj.current['flyline'].userData['flylineTwen']){
            cardItemObj.current['flyline'].userData['flylineTwen'].kill()
        }
        if (cardItemObj.current['flyline'].userData['flylineOpacityTwen']){
            cardItemObj.current['flyline'].userData['flylineOpacityTwen'].kill()
        }

        if (cardItemObj.current['ground_shader'].userData['groundShaderTwen']) {
            cardItemObj.current['ground_shader'].userData['groundShaderTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['ground_shader'].userData['groundShadernCompleteTwen']) {
            cardItemObj.current['ground_shader'].userData['groundShadernCompleteTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['luntaiqian'].userData['luntaiqianTwen']) {
            cardItemObj.current['luntaiqian'].userData['luntaiqianTwen'].kill() // 立即停止并销毁这个动画
        }
        if (cardItemObj.current['luntaiqian'].userData['luntaiqianCompleteTwen']) {
            cardItemObj.current['luntaiqian'].userData['luntaiqianCompleteTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['luntaiqian'].userData['cameraPositionX']) {
            cardItemObj.current['luntaiqian'].userData['cameraPositionX'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['luntaiqian'].userData['cameraPositionY']) {
            cardItemObj.current['luntaiqian'].userData['cameraPositionY'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['luntaihou'].userData['luntaihouTwen']) {
            cardItemObj.current['luntaihou'].userData['luntaihouTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['luntaihou'].userData['luntaihouCompleteTwen']) {
            cardItemObj.current['luntaihou'].userData['luntaihouCompleteTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['scanline'].userData['scanlineOpacityTwen']) {
            cardItemObj.current['scanline'].userData['scanlineOpacityTwen'].kill() // 立即停止并销毁这个动画
        }

        if (cardItemObj.current['carFrame3Main'].userData['scanlineOffsetTwen']) {
            cardItemObj.current['carFrame3Main'].userData['scanlineOffsetTwen'].kill() // 立即停止并销毁这个动画
        }
        // 需要重新管理

    }

    function runCar() {
        userSwitchRef.current = 0
        switchRunModel()
    }

    function lengthCar() {
        userSwitchRef.current = 1
        switchRunModel()
        console.log("车身")
    }

    function tailwindCar() {
        userSwitchRef.current = 2
        switchRunModel()
        console.log("风阻")
    }

    function aiControllerCar() {
        userSwitchRef.current = 3 // 切换
        switchRunModel()
        console.log("车身")
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden">

            <div className="absolute z-10 h-full right-0 ">
                <div className="flex items-center justify-end h-full">
                    <div className="flex-row p-6">
                        <button className="block select-none" onClick={runCar}>
                            驾驶
                        </button>
                        <button className="block select-none pt-12" onClick={lengthCar}>
                            车身
                        </button>
                        <button className="block select-none pt-12" onClick={tailwindCar}>
                            风阻
                        </button>
                        <button className="block select-none pt-12" onClick={aiControllerCar}>
                            智驾
                        </button>
                    </div>
                </div>
            </div>
            {/* Three.js 画布容器 */}
            <div ref={mountRef} className="absolute inset-0 z-0"/>
            {/* 底部信息 */}

        </div>
    )
}

export default App
