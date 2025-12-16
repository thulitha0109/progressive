"use client"

import React, { useRef } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from "@/lib/utils"

// --- 1. Custom Shader Material ---
const LiquidDistortionMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uMouse: new THREE.Vector2(0, 0),
        uResolution: new THREE.Vector2(1, 1),
        uImageResolution: new THREE.Vector2(1, 1),
        uTime: 0,
        uHover: 0,
        uFit: 0, // 0 = cover, 1 = contain
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform float uTime;
    uniform float uHover;
    uniform float uFit;
    varying vec2 vUv;

    // Simplex 2D noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // 1. UV Coordinate Calculation for 'cover' vs 'contain'
      vec2 s = uResolution; // Screen/Viewport
      vec2 i = uImageResolution; // Image
      float rs = s.x / s.y;
      float ri = i.x / i.y;
      
      // Determine which dimension to match based on fit mode
      // uFit < 0.5 (Cover): rs < ri ? match height : match width
      // uFit > 0.5 (Contain): rs > ri ? match height : match width
      bool matchHeight = (uFit < 0.5) ? (rs < ri) : (rs > ri);
      
      vec2 new = matchHeight ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
      vec2 offset = (matchHeight ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
      
      // Centered UVs
      vec2 uv = vUv * s / new + offset;
      
      // Clip if using 'contain' behavior to avoid repetition/stretching outside bounds
      if (uFit > 0.5) {
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
              gl_FragColor = vec4(0.0);
              return;
          }
      }

      // 2. Interactive Liquid Logic
      float aspect = uResolution.x / uResolution.y;
      vec2 aspectUV = vUv;
      aspectUV.x *= aspect;
      vec2 mouseAspect = uMouse;
      mouseAspect.x *= aspect;

      float dist = length(aspectUV - mouseAspect);
      float radius = 0.7;
      float strength = (1.0 - smoothstep(0.0, radius, dist));
      
      float noise = snoise(uv * 3.0 + uTime * 0.3) * 0.02;
      vec2 disp = normalize(aspectUV - mouseAspect) * strength * uHover * 1.5;
      
      // 3. Chromatic Aberration
      float r = texture2D(uTexture, uv - disp * 0.02 + noise).r;
      float g = texture2D(uTexture, uv + noise * 0.5).g; 
      float b = texture2D(uTexture, uv + disp * 0.02 - noise).b;
      
      float a = texture2D(uTexture, uv + noise * 0.5).a;
      
      vec3 color = vec3(r, g, b);

      // 4. Vibrance / Saturation Boost
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(gray), color, 2.0); 

      // 5. Purple Tint & Green Reduction
      vec3 purple = vec3(0.7, 0.1, 1.0);
      color = mix(color, purple, strength * 0.4 * uHover);
      color.g *= 0.95;

      color += vec3(strength * 0.2 * uHover) * a;

      gl_FragColor = vec4(color, a);
    }
  `
)

extend({ LiquidDistortionMaterial })

// --- 2. Scene Component ---
function Scene({ imageUrl, fit }: { imageUrl: string, fit: 'cover' | 'contain' }) {
    const { viewport, size } = useThree()
    const texture = useTexture(imageUrl)
    const ref = useRef<any>(null)

    const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
    const hoverStrength = useRef(0)

    useFrame((state) => {
        if (!ref.current) return

        const targetX = (state.pointer.x + 1) / 2
        const targetY = (state.pointer.y + 1) / 2

        mouseRef.current.x += (targetX - mouseRef.current.x) * 0.1
        mouseRef.current.y += (targetY - mouseRef.current.y) * 0.1

        const isHovering = Math.abs(state.pointer.x) < 1 && Math.abs(state.pointer.y) < 1
        const targetHover = isHovering ? 1.0 : 0.0
        hoverStrength.current += (targetHover - hoverStrength.current) * 0.05

        ref.current.uTime = state.clock.getElapsedTime()
        ref.current.uMouse = mouseRef.current
        ref.current.uHover = hoverStrength.current
        ref.current.uFit = fit === 'contain' ? 1.0 : 0.0
        ref.current.uResolution = new THREE.Vector2(size.width, size.height)

        const tex = texture as THREE.Texture
        if (tex.image) {
            const img = tex.image as HTMLImageElement
            ref.current.uImageResolution = new THREE.Vector2(img.width, img.height)
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            {/* @ts-ignore */}
            <liquidDistortionMaterial
                ref={ref}
                uTexture={texture}
                transparent
            />
        </mesh>
    )
}

// --- 3. Main Component ---
interface LiquidBackgroundProps {
    imageUrl: string
    className?: string
    onReady?: () => void
    objectFit?: 'cover' | 'contain'
}

export function LiquidBackground({ imageUrl, className, onReady, objectFit = 'cover' }: LiquidBackgroundProps) {
    const [ready, setReady] = React.useState(false)

    return (
        <div className={className}>
            {/* Static Fallback Image */}
            <img
                src={imageUrl}
                alt="Background"
                className={cn(
                    "absolute inset-0 w-full h-full blur-xl scale-100 transition-opacity duration-[2000ms] ease-in-out",
                    objectFit === 'contain' ? 'object-contain' : 'object-cover',
                    ready ? 'opacity-0' : 'opacity-100'
                )}
                loading="eager"
            />

            {/* 3D Liquid Layer */}
            <div
                className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${ready ? 'opacity-100' : 'opacity-0'}`}
            >
                <Canvas
                    camera={{ position: [0, 0, 1], fov: 75 }}
                    dpr={[1, 1.5]}
                    gl={{ antialias: true, alpha: true }}
                    onCreated={() => {
                        setReady(true)
                        onReady?.()
                    }}
                >
                    <Scene imageUrl={imageUrl} fit={objectFit} />
                </Canvas>
            </div>
        </div>
    )
}
