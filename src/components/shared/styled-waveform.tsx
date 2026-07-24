"use client"

import { useEffect, useRef, useState } from "react"

interface CardWaveformProps {
  peaks: number[]
  isPlaying?: boolean
  height?: number
  barColor?: string | string[]
  barCount?: number
}

export function CardWaveform({
  peaks,
  isPlaying = false,
  height = 32,
  barColor = ["#2563eb", "#7c3aed"],
  barCount = 24,
}: CardWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | undefined>(undefined)
  const phaseRef = useRef(0)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Measure canvas, react to layout/resize changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) return
      const w = Math.round(rect.width * dpr)
      const h = Math.round(height * dpr)
      canvas.width = w
      canvas.height = h
      setSize({ width: w, height: h })
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => ro.disconnect()
  }, [height])

  // Downsample + draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !peaks || peaks.length === 0) return
    if (size.width === 0 || size.height === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bucketSize = Math.max(1, Math.floor(peaks.length / barCount))
    const bars: number[] = []
    for (let i = 0; i < barCount; i++) {
      const start = i * bucketSize
      const slice = peaks.slice(start, start + bucketSize)
      const avg = slice.length
        ? slice.reduce((a, b) => a + Math.abs(b), 0) / slice.length
        : 0
      bars.push(Math.max(0.08, avg))
    }

    let cancelled = false

    const draw = () => {
      if (cancelled) return

      const w = size.width
      const h = size.height
      ctx.clearRect(0, 0, w, h)

      const gap = 2 * (window.devicePixelRatio || 1)
      const barWidth = (w - gap * (barCount - 1)) / barCount

      phaseRef.current += isPlaying ? 0.12 : 0

      for (let i = 0; i < barCount; i++) {
        let amp = bars[i]

        if (isPlaying) {
          const wobble = Math.sin(phaseRef.current + i * 0.6) * 0.15
          amp = Math.min(1, Math.max(0.08, amp + wobble))
        }

        const barH = amp * h
        const x = i * (barWidth + gap)
        const y = (h - barH) / 2

        if (barWidth <= 0 || barH <= 0) continue

        if (Array.isArray(barColor)) {
          const gradient = ctx.createLinearGradient(x, y, x, y + barH)
          gradient.addColorStop(0, barColor[0])
          gradient.addColorStop(1, barColor[1])
          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = barColor
        }
        ctx.globalAlpha = isPlaying ? 1 : 0.55
        roundRect(ctx, x, y, barWidth, barH, barWidth / 2)
        ctx.fill()
      }

      if (isPlaying) rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [peaks, isPlaying, barColor, barCount, size])

  // FIX: width: "100%" so it fills the parent container
  return <canvas ref={canvasRef} style={{ width: "25%", height }} className="block" />
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w <= 0 || h <= 0) return
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}