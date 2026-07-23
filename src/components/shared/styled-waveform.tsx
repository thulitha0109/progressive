"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

interface StyledWaveformProps {
    isPlaying: boolean
    audioElement?: HTMLAudioElement | null
    peaks?: number[] | null
    duration?: number
    className?: string
    bars?: number
    height?: number
    attack?: number
    release?: number
}

export function StyledWaveform({
    isPlaying,
    audioElement,
    peaks = null,
    duration,
    className,
    bars = 23, // Fixed to 13 bars
    height = 24,
    attack = 0.75, // Responsive up-bounce
    release = 0.25, // Fluid downward settle
}: StyledWaveformProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const stateRef = useRef({ isPlaying, attack, release })
    
    const animationDataRef = useRef<{
        currentHeights: number[]
    }>({
        currentHeights: new Array(bars).fill(0.1)
    })

    useEffect(() => {
        stateRef.current.isPlaying = isPlaying
        stateRef.current.attack = attack
        stateRef.current.release = release
    }, [isPlaying, attack, release])

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const width = 24 // Constrained max-width boundary
        const viewHeight = height

        const scene = new THREE.Scene()

        // Lighting to define structural glass reflections
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
        scene.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
        directionalLight.position.set(0, 8, 4)
        scene.add(directionalLight)

        const camera = new THREE.OrthographicCamera(0, width, viewHeight, 0, 0.1, 1000)
        camera.position.z = 10

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(width, viewHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        const barWidth = 1 
        const geometry = new THREE.BoxGeometry(barWidth, 1, 0.5)
        
        // Base Physically Based Glass Material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            transparent: true,
            roughness: 0.15,
            metalness: 0.1,
            transmission: 0.85,
            ior: 1.45,
            thickness: 0.8,
            side: THREE.DoubleSide
        })

        const instancedMesh = new THREE.InstancedMesh(geometry, glassMaterial, bars)
        scene.add(instancedMesh)

        const dummy = new THREE.Object3D()
        const color = new THREE.Color()
        let rafId: number

        const animate = () => {
            rafId = requestAnimationFrame(animate)

            const currentActive = stateRef.current.isPlaying
            const hasPeaks = Array.isArray(peaks) && peaks.length > 0
            const animData = animationDataRef.current

            let currentProgress = 0
            let instantaneousRhythmPeak = 0.1

            if (hasPeaks && audioElement) {
                const trackDuration = duration || audioElement.duration || 1
                currentProgress = Math.min(1, Math.max(0, audioElement.currentTime / trackDuration))
                
                const totalPeaks = peaks.length
                const currentMomentIdx = Math.floor(currentProgress * (totalPeaks - 1))
                instantaneousRhythmPeak = peaks[currentMomentIdx] || 0.1
            }

            const centerIndex = (bars - 1) / 2 // Index 6 for 13 bars

            for (let i = 0; i < bars; i++) {
                let targetHeight = 0.1

                // Calculate proximity to the middle bar (0 at center, 1 at the extreme outer edges)
                const distanceFromCenter = Math.abs(i - centerIndex) / centerIndex
                
                // Smooth bell curve modifier (1.0 at center, drops to 0.0 at edges)
                const smoothGaussianWeight = Math.exp(-Math.pow(distanceFromCenter * 1.5, 2))

                if (hasPeaks && currentActive) {
                    // Pull the live track data to drive general intensity
                    const totalPeaks = peaks.length
                    const peakIndex = Math.min(
                        totalPeaks - 1,
                        Math.max(0, Math.floor((i / bars) * totalPeaks))
                    )
                    const structuralBase = peaks[peakIndex]

                    // Inject live rhythm peak: Center bars scale up high and smooth, edges fall away
                    const beatImpact = instantaneousRhythmPeak * 1.6
                    targetHeight = structuralBase * (0.15 + beatImpact * smoothGaussianWeight)
                } else if (currentActive) {
                    // Procedural rhythm pulsing when pre-computed peaks array is omitted
                    const livePulse = Math.sin(performance.now() * 0.008) * 0.5 + 0.5
                    targetHeight = (0.1 + livePulse * 0.9) * smoothGaussianWeight
                }

                targetHeight = Math.max(0.08, Math.min(1.0, targetHeight))

                // Apply non-linear interpolation transitions
                const prevHeight = animData.currentHeights[i]
                const rate = targetHeight > prevHeight ? stateRef.current.attack : stateRef.current.release
                const nextHeight = prevHeight + (targetHeight - prevHeight) * rate
                animData.currentHeights[i] = nextHeight

                const computedHeight = nextHeight * viewHeight
                
                // Perfect spacing alignment for 13 1px bars inside a 24px zone
                const xPos = i * (width / (bars - 0.5)) + barWidth / 2
                
                dummy.position.set(xPos, computedHeight / 2, 0)
                dummy.scale.set(1, computedHeight, 1)
                dummy.updateMatrix()
                instancedMesh.setMatrixAt(i, dummy.matrix)

                // --- Color & Glow Profile Design ---
                if (currentActive) {
                    // Calculate live dynamic glow based on current height and center-closeness
                    const liveGlowFactor = nextHeight * smoothGaussianWeight

                    if (liveGlowFactor > 0.35) {
                        // High Peak Center Beat: Bright cyan-white glowing core
                        color.setRGB(
                            0.3 + liveGlowFactor * 0.7, 
                            0.8 + liveGlowFactor * 0.2, 
                            0.9 + liveGlowFactor * 0.1
                        )
                    } else {
                        // Flanks & low periods: Fades out smoothly into clear glass slate gray
                        const grayValue = 0.2 + (1.0 - distanceFromCenter) * 0.15
                        color.setRGB(grayValue, grayValue + 0.05, grayValue + 0.08)
                    }
                } else {
                    // Static, sleeping deep glass slate gray when audio is paused
                    const idleGray = 0.22 - (distanceFromCenter * 0.05)
                    color.setRGB(idleGray, idleGray, idleGray)
                }
                
                instancedMesh.setColorAt(i, color)
            }

            instancedMesh.instanceMatrix.needsUpdate = true
            if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true

            renderer.render(scene, camera)
        }

        animate()

        return () => {
            cancelAnimationFrame(rafId)
            geometry.dispose()
            glassMaterial.dispose()
            renderer.dispose()
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
        }
    }, [bars, height, peaks, duration])

    return (
        <div 
            ref={containerRef} 
            className={cn("w-full max-w-[24px] relative overflow-hidden", className)} 
            style={{ height: `${height}px` }}
        />
    )
}