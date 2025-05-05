import { useEffect, useRef } from "react"
import * as THREE from 'three'

export default function ThreeJSBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement)
    }

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1000
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3),
    )

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x97f0e5, // Secondary color
      transparent: true,
      opacity: 0.6,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    camera.position.z = 15

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      particlesMesh.rotation.y += 0.001
      particlesMesh.rotation.x += 0.0005
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="fixed inset-0 -z-10" />
}