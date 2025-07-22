import {useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

function App() {


    let plane1 = new THREE.Plane(new THREE.Vector3(0,0,1));

    let plane2 = new THREE.Plane(new THREE.Vector3(0,0,1));
    let plane3 = new THREE.Plane(new THREE.Vector3(0,0,-1));
    let plane4 = new THREE.Plane(new THREE.Vector3(0,0,-1));
    let userMouseDown = useRef(false);
    let aiRunScanPositionArr = [];
    let aiRunScanPositionArrLookAt = new THREE.Vector3(0,0.1,0);
    let aiRunScanMashPositionArr = [];
    let aiRunScanMashPositionArrGroup = new THREE.Group()

    let carEffect = [];

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

        // renderer.clippingPlanes = [plane1]

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
                        console.log("su7",child);
                        plane1.constant = 1.1
                        child.traverse((item) => {
                            if (item.name === "carMain"){
                                console.log("carMain",item)
                                item.traverse((carMainItem)=>{
                                    if (carMainItem.material){
                                        // carMainItem.material.color = "#FFFFFF"
                                        // carMainItem.material.alphaToCoverage  = true
                                    // if (carMainItem.material){
                                        carMainItem.material.alphaToCoverage  = true
                                        carMainItem.material.clippingPlanes = [plane1]
                                    //     carMainItem.material.alphaToCoverage  = true
                                        carEffect.push(carMainItem)
                                    }
                                })

                            }
                            if (item.name === "luntaihou"||item.name === "luntaiqian"){
                                item.traverse((lunItems)=>{
                                    if (lunItems.material){
                                        lunItems.material.alphaToCoverage  = true
                                        lunItems.material.clippingPlanes = [plane1]
                                    }
                                })
                            }
                        })
                        console.log("1111carEffect",carEffect)
                        // let planeHelper1 = new THREE.PlaneHelper(plane1,2,0xffff00);
                        // planeHelper1.position
                        // let planeHelper2 = new THREE.PlaneHelper(plane2,2,0xffff00);

                        // scene.add(planeHelper1)
                        renderer.localClippingEnabled = true;

                        // scene.add(planeHelper2)
                    }

                    if (child.name == "su7WhiteRoot") {
                        plane2.constant = 1.02
                        plane3.constant = -1.03
                        console.log("su7White",child.name)
                        child.traverse((itemRoot) => {
                            console.log("itemRoot",itemRoot.name)
                            if (itemRoot.material){
                                itemRoot.material.alphaToCoverage  = true
                                itemRoot.material.clippingPlanes = [plane2,plane3]
                            }
                        })
                        // let planeHelper2 = new THREE.PlaneHelper(plane2,2,0x00ff00);
                        // let planeHelper3 = new THREE.PlaneHelper(plane3,2,0x0000ff);
                        // planeHelper1.position
                        // let planeHelper2 = new THREE.PlaneHelper(plane2,2,0xffff00);
                        child.visible = false
                        // scene.add(planeHelper2)
                        // scene.add(planeHelper3)

                        renderer.localClippingEnabled = true;
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
                        plane4.constant = 1.15
                        child.traverse((itemRoot) => {
                            console.log("itemRoot",itemRoot.name)
                            if (itemRoot.material){
                                itemRoot.material.alphaToCoverage  = true
                                itemRoot.material.clippingPlanes = [plane4]
                            }
                        })
                        // let planeHelper4 = new THREE.PlaneHelper(plane4,2,0x00ffF0);
                        // scene.add(planeHelper4)
                        child.visible = false
                    }


                    if (child.name === 'aiRunScan'){
                        if (child.geometry){
                            let attributes = child.geometry.getAttribute("position");

                            console.log("attributes",attributes)
                            for (let i = 0; i < attributes.count; i++) {

                                //把雷达的顶点位置 转换成vector3 数组 存下来
                                let vector3 = new THREE.Vector3();
                                vector3.fromBufferAttribute(attributes,i);
                                aiRunScanPositionArr.push(vector3)
                            }

                            scene.add(aiRunScanMashPositionArrGroup)
                        }
                    }
                    if (child.name === 'groundFunc4') {
                        child.visible = false
                    }
                    if (child.name === 'ohercar2'||child.name === 'ohercar1') {
                        child.visible = false
                        child.userData["positionRaw"] = child.position.clone()
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
                // cardItemObj.current['groundFunc4'].visible = false

                ground.visible = false  // 临时隐藏地面以避免自反射
                cubeCamera.position.copy(camera.current.position)
                cubeCamera.position.y = -cubeCamera.position.y
                cubeCamera.update(renderer, scene)
                if (userMouseDown.current && userSwitchRef.current=== 3){
                    cardItemObj.current['groundFunc4'].visible = true
                }

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
            userMouseDown.current = true
            startAni()
        })
        window.addEventListener('mouseup', (e) => {
            if (e.target.tagName === 'BUTTON') {
                return
            }
            userMouseDown.current = false
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

        function openGui(){
            let gui = new GUI();
            let folder = gui.addFolder("裁切位置");
            console.dir("carEffect",carEffect)


            folder.add(renderer, "localClippingEnabled").name("Enable Clipping").listen()

            folder.add(plane1,"constant",-1,1.1).name("X").onChange((v)=>{
                carEffect.map(item=>{
                    // console.log("item",item)
                    if (item.material){
                        // item.material.alphaToCoverage = v;
                        // item.material.alphaTest = v
                        // item.material.needsUpdate = true
                    }
                })
            })

            folder.add(plane2,"constant",-1,1.2).name("X2").onChange((v)=>{
                carEffect.map(item=>{
                    // console.log("item",item)
                    if (item.material){
                        // item.material.alphaToCoverage = v;
                        // item.material.alphaTest = v
                        // item.material.needsUpdate = true
                    }
                })
            })
            folder.add(plane3,"constant",-1,1.1).name("X3").listen()
            // folder.add(plane4,"constant",-1,1.1).name("X4").listen()
            gui.folders = [folder]
        }
        // openGui()

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
            const carFrame3Main = cardItemObj.current['carFrame3Main'];
            if (carFrame3Main.userData["scanlinePlaneStartTwen"]){
                carFrame3Main.userData["scanlinePlaneStartTwen"].kill()
            }

            if (carFrame3Main) {
                carFrame3Main.userData["scanlinePlaneEndTwen"] = gsap.to(plane4, {
                    constant: -1.05,
                    duration: 1,
                    repeat:0,
                    ease:"none",
                    onComplete: () => {
                        carFrame3Main.visible = false
                    }
                })
            }


            let su7Main = cardItemObj.current['su7'];

            if (su7Main.userData["su7MainPlaneStartTwen"]){
                su7Main.userData["su7MainPlaneStartTwen"].kill()
            }

            su7Main.userData["su7MainPlaneEndTwen"] = gsap.to(plane1, {
                constant: 1.1,
                duration: 1,
                repeat:0,
                ease:"none",
                onStart:()=>{
                    su7Main.visible = true
                }
            })


            let su7WhiteRoot = cardItemObj.current['su7WhiteRoot'];

            if (su7WhiteRoot.userData["su7WhiteRootPlane2StartTwen"]){
                su7WhiteRoot.userData["su7WhiteRootPlane2StartTwen"].kill()
            }

            if (su7WhiteRoot.userData["su7WhiteRootPlane3StartTwen"]){
                su7WhiteRoot.userData["su7WhiteRootPlane3StartTwen"].kill()
            }

            su7WhiteRoot.userData["su7WhiteRootPlane2EndTwen"] = gsap.to(plane2, {
                constant: 1.1,
                duration: 1,
                repeat:0,
                ease:"none"
            })
            su7WhiteRoot.userData["su7WhiteRootPlane3EndTwen"] = gsap.to(plane3, {
                constant: -1.08,
                duration: 1,
                repeat:0,
                ease:"none"
            })

            // cardItemObj.current['su7'].visible = true
            // cardItemObj.current['luntaiqian'].visible = true
        }

        if (userSwitchRef.current===3){
            cardItemObj.current['ground'].visible = true
            cardItemObj.current['ground_shadow'].visible = true

            aiRunScanMashPositionArrGroup.visible = false
            console.log("关闭 4")
            cardItemObj.current['groundFunc4'].visible = false
            cardItemObj.current['pointLight'].visible = true
            cardItemObj.current['plandlight'].visible = true


            let ohercar1 = cardItemObj.current['ohercar1'];
            let ohercar2 = cardItemObj.current['ohercar2'];
            ohercar1.visible = false
            ohercar2.visible = false

            if (ohercar1.userData["positionToTwen"]){
                ohercar1.userData["positionToTwen"].kill()
            }
            if (ohercar2.userData["positionToTwen"]){
                ohercar2.userData["positionToTwen"].kill()
            }

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

            // 控制三阶段的汽车线条
            const carFrame3Main = cardItemObj.current['carFrame3Main'];
            if (carFrame3Main) {

                if (carFrame3Main.userData["scanlinePlaneEndTwen"]){
                    carFrame3Main.userData["scanlinePlaneEndTwen"].kill()
                }

                if (carFrame3Main.userData["scanlineOffsetTwen"]){
                    carFrame3Main.userData["scanlineOffsetTwen"].kill()
                }

                carFrame3Main.userData["scanlineOffsetTwen"] = gsap.to(carFrame3Main.material.map.offset, {
                    x: carFrame3Main.material.map.offset.x+1,
                    duration: 3,
                    repeat: -1,
                    ease:"none",
                })


                carFrame3Main.userData["scanlinePlaneStartTwen"] = gsap.to(plane4, {
                    constant: 1.15,
                    duration: 1,
                    repeat:0,
                    ease:"none",
                    onStart:()=>{
                        carFrame3Main.visible = true
                    }
                })

                // 控制车本体裁剪
                let su7Main = cardItemObj.current['su7'];
                if (su7Main.userData["su7MainPlaneEndTwen"]){
                    su7Main.userData["su7MainPlaneEndTwen"].kill()
                }
                su7Main.userData["su7MainPlaneStartTwen"] = gsap.to(plane1, {
                    constant: - 1.1,
                    duration: 1,
                    repeat:0,
                    ease:"none",
                    onComplete:()=>{
                        su7Main.visible = false
                    }
                })

                // 控制车本体裁剪描边

                let su7WhiteRoot = cardItemObj.current['su7WhiteRoot'];
                su7WhiteRoot.visible = true
                if (su7WhiteRoot.userData["su7WhiteRootPlane2EndTwen"]){
                    su7WhiteRoot.userData["su7WhiteRootPlane2EndTwen"].kill()
                }
                if (su7WhiteRoot.userData["su7WhiteRootPlane3EndTwen"]){
                    su7WhiteRoot.userData["su7WhiteRootPlane3EndTwen"].kill()
                }

                su7WhiteRoot.userData["su7WhiteRootPlane2StartTwen"] = gsap.to(plane2, {
                    constant: -1.1,
                    duration: 1,
                    repeat:0,
                    ease:"none"
                })
                su7WhiteRoot.userData["su7WhiteRootPlane3StartTwen"] = gsap.to(plane3, {
                    constant: 1.12,
                    duration: 1,
                    repeat:0,
                    ease:"none"
                })



            }





           // cardItemObj.current['su7'].visible = false
           // cardItemObj.current['luntaiqian'].visible = false



        }
        if (userSwitchRef.current===3){
            // cardItemObj.current['su7'].visible = false





            cardItemObj.current['ground'].visible = false
            cardItemObj.current['ground_shadow'].visible = false





            // 处理路面
            let groundFunc4 = cardItemObj.current['groundFunc4'];
            groundFunc4.visible = true
            gsap.to(groundFunc4.material.map.offset,{
                x:groundFunc4.material.map.offset.x+1,
                duration:1.2,
                ease:"none",
                repeat:-1
            })

            cardItemObj.current['pointLight'].visible = false
            cardItemObj.current['plandlight'].visible = false

            let ohercar1 = cardItemObj.current['ohercar1'];
            let ohercar2 = cardItemObj.current['ohercar2'];
            ohercar1.visible = true
            ohercar2.visible = true

            ohercar1.position.copy(ohercar1.userData["positionRaw"])
            ohercar2.position.copy(ohercar2.userData["positionRaw"])

            if (ohercar1.userData["positionToTwen"]){
                ohercar1.userData["positionToTwen"].kill()
            }
            if (ohercar2.userData["positionToTwen"]){
                ohercar2.userData["positionToTwen"].kill()
            }

            ohercar1.userData["positionToTwen"] = gsap.to(ohercar1.position,
                {
                z:100,
                duration:4,
                repeat:-1,
                ease:"none"
            })
            ohercar2.userData["positionToTwen"] = gsap.to(ohercar2.position,
                {
                z:-100,
                duration:4,
                repeat:-1,
                ease:"none"
            })






            // 处理AI雷达
            aiRunScanMashPositionArrGroup.visible = true

            if (aiRunScanMashPositionArrGroup.userData['Pass']) return;

            aiRunScanMashPositionArrGroup.position.y = 0.1

            for (let r = 0; r < 6; r++) {
                let boxGeo = new THREE.BoxGeometry(0.02,0.02,0.05);

                for (let i = 0; i < aiRunScanPositionArr.length; i++) {
                    let boxBasicMaterial = new THREE.MeshBasicMaterial({
                        color:0xffffff,
                        depthTest:false
                    });
                    let boxMash = new THREE.Mesh(boxGeo,boxBasicMaterial)
                    console.log("boxMash",boxMash)
                    boxMash.position.copy(aiRunScanPositionArr[i])
                    // scene.add(boxMash);
                    aiRunScanMashPositionArrGroup.add(boxMash);
                    aiRunScanMashPositionArr.push(boxMash)

                    boxMash.lookAt(aiRunScanPositionArrLookAt)
                    boxMash.userData["rawPosition"] = boxMash.position.clone()
                    boxMash.translateZ(-1.5)

                    boxMash.userData["toPosition"] = boxMash.position.clone()
                    boxMash.translateZ(1.2)
                    if (r==0) {
                        boxMash.userData["ease"] = 0.5
                    }
                    if (r==1) {
                        boxMash.userData["ease"] = 1
                    }
                    if (r==2) {
                        boxMash.userData["ease"] = 1.5
                    }
                    if (r==3) {
                        boxMash.userData["ease"] = 3
                    }
                    if (r==4) {
                        boxMash.userData["ease"] = 4
                    }
                    if (r==5) {
                        boxMash.userData["ease"] = 4.5
                    }


                    boxMash.visible = false
                    // boxMash.userData["delay"] = boxMash.position.clone()
                }

                for (let i = 0; i < aiRunScanMashPositionArr.length; i++) {
                    gsap.to(aiRunScanMashPositionArr[i].position,{
                        x: aiRunScanMashPositionArr[i].userData["toPosition"].x,
                        y: aiRunScanMashPositionArr[i].userData["toPosition"].y,
                        z: aiRunScanMashPositionArr[i].userData["toPosition"].z,
                        duration:5,
                        ease:'none',
                        delay:aiRunScanMashPositionArr[i].userData["ease"],
                        repeat:-1,
                        onStart:()=>{
                            aiRunScanMashPositionArr[i].visible = true
                        }
                    })
                }
            }

            aiRunScanMashPositionArrGroup.userData['Pass'] = true



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
                <div className="flex items-center justify-end h-full ">
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
