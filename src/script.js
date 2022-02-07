import './style.css'
import * as $ from './js/jquery.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'dat.gui'
import gsap from 'gsap'

// Debug
const gui = new GUI()
gui.destroy()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width:window.innerWidth,
    height:window.innerHeight
}

// resize
window.addEventListener('resize',() =>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    renderer.setSize(sizes.width,sizes.height)
})
// Raycaster
const raycaster = new THREE.Raycaster()


// Scene
const scene = new THREE.Scene()

// Camera
const cameraPositions = {
    fov:75,
    size:sizes.width/sizes.height,
    near:0.1,
    far:1000
}
const camera = new THREE.PerspectiveCamera(cameraPositions.fov,cameraPositions.size,cameraPositions.near,cameraPositions.far)
camera.position.z = 50

// Plane color
const planeColor = {
    r:0.19,
    g:0.35,
    b:0.3
}

gui.add(planeColor,'r',0,1,0.001).onChange(generatePlane)
gui.add(planeColor,'g',0,1,0.001).onChange(generatePlane)
gui.add(planeColor,'b',0,1,0.001).onChange(generatePlane)

// Generate Plane
function generatePlane(){
    plane.geometry.dispose()
    plane.geometry = new THREE.PlaneBufferGeometry(
        planeSize.width,
        planeSize.height,
        planeSize.widthVertice,
        planeSize.heightVertice
    )

    const { array } = plane.geometry.attributes.position
    const randomValues = []
    for(let i = 0; i < array.length; i++){
        if(i % 3 === 0){
            const x = array[i]
            const y = array[i + 1]
            const z = array[i + 2]

            array[i] = x + (Math.random() - 0.5) * 3
            array[i + 1] = y + (Math.random() - 0.5) * 3
            array[i + 2] = z + (Math.random() - 0.5) * 3
        }

        randomValues.push(Math.random() * Math.PI * 2)
    }
    plane.geometry.attributes.position.originalPosition = plane.geometry.attributes.position.array
    plane.geometry.attributes.position.randomValues = randomValues
    const colors = []
    for(let i = 0; i< plane.geometry.attributes.position.count; i++){
        colors.push(planeColor.r,planeColor.g,planeColor.b)
    }
    plane.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(colors),3))
}

// Plane's Size
const planeSize = {
    width:400,
    height:400,
    widthVertice:50,
    heightVertice:50
}

// Plane
const planeGeometry = new THREE.PlaneBufferGeometry(planeSize.width,planeSize.height,planeSize.widthVertice,planeSize.heightVertice)
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: true,
    vertexColors: true,

})
const plane = new THREE.Mesh(planeGeometry,planeMaterial)
scene.add(plane)
generatePlane()

gui.add(planeSize,'width',1,500,1).onChange(generatePlane)
gui.add(planeSize,'height',1,500,1).onChange(generatePlane)
gui.add(planeSize,'widthVertice',1,100,1).onChange(generatePlane)
gui.add(planeSize,'heightVertice',1,100,1).onChange(generatePlane)


// Stars
const starGeometry = new THREE.BufferGeometry()
const starCount = 10000
const positions = new Float32Array(starCount * 3)

for(let i = 0;i < starCount * 3;i++){
    positions[i] = (Math.random() - 0.5) * 900
}
starGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3))

const starMaterial = new THREE.PointsMaterial()
starMaterial.side = 0.3
starMaterial.sizeAttenuation = true

const star = new THREE.Points(starGeometry,starMaterial)
star.position.y = 600
scene.add(star)

// Light
const light = new THREE.DirectionalLight(0xffffff,1,1)
light.position.set(0,-1,1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff,1,1)
backLight.position.set(0,0,-1)
scene.add(backLight)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas:canvas
})
renderer.setSize(sizes.width,sizes.height)


// Control
const control = new OrbitControls(camera, canvas)
control.enableDamping = true
control.enabled = false

// Mouse Coordinate
const mouse = {
    x:undefined,
    y:undefined
}

let frame = 0;
let startMove = 0;
function tick(){
    requestAnimationFrame(tick)
    frame += 0.01
    // Render
    renderer.render(scene,camera)

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( mouse, camera );
    const intersect = raycaster.intersectObject(plane)
    // if intersect, add hover color
    if(intersect.length > 0){
        const intersectFace = intersect[0].face
        const intersectColor = intersect[0].object.geometry.attributes.color

        const initialColor = {
            r:0.19,
            g:0.35,
            b:0.3
        }

        const hoveredColor = {
            r:0.4,
            g:0.5,
            b:0.4
        }

        gsap.to(hoveredColor,{
            r:initialColor.r,
            g:initialColor.g,
            b:initialColor.b,
            onUpdate:() =>{
                // X
                intersectColor.setX(intersectFace.a,hoveredColor.r)
                intersectColor.setY(intersectFace.a,hoveredColor.g)
                intersectColor.setZ(intersectFace.a,hoveredColor.b)

                // Y
                intersectColor.setX(intersectFace.b,hoveredColor.r)
                intersectColor.setY(intersectFace.b,hoveredColor.g)
                intersectColor.setZ(intersectFace.b,hoveredColor.b)

                // Z
                intersectColor.setX(intersectFace.c,hoveredColor.r)
                intersectColor.setY(intersectFace.c,hoveredColor.g)
                intersectColor.setZ(intersectFace.c,hoveredColor.b)

                // update color
                intersectColor.needsUpdate = true
            }
        })
    }

    // update plane vertice
    const {array, originalPosition, randomValues} = plane.geometry.attributes.position
    for(let i = 0; i < array.length; i++){
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.005
        array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.005
    }

    plane.geometry.attributes.position.needsUpdate = true

    // animate camera forward
    camera.translateZ(- (startMove * frame) * 3)
}
tick()

// Update Mouse coordinate
addEventListener('mousemove',(event) => {
    mouse.x = event.clientX/sizes.width * 2 - 1
    mouse.y = - (event.clientY/sizes.height) * 2 + 1
})

$(document).on('click','#viewWork',function(){
    $('#htmlText').addClass('invi')
    gsap.to(camera.position,{
        duration:0.25,
        z:30,
        onChange: () => {
            gsap.to(camera.rotation,{
                duration:0.5,
                x:1.5
            })
        },
        onComplete:() =>{
            setTimeout(() => {
                startMove = 1
            },1000)
        }
    })
})