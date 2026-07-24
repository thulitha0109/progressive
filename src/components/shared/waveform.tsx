"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface FullScreenWaveformProps {
  media?: HTMLMediaElement | null
  height?: number
  waveColor?: string
  progressColor?: string
  cursorColor?: string
  playheadColor?: string
  peaks?: number[] | null
  duration?: number
}

function formatTime(t: number) {
  if (!Number.isFinite(t)) return "0:00"
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

// Reduce an arbitrary-length peaks array down to `numBars` values using
// max-in-bucket, so the waveform stays visually representative at any width.
function resamplePeaks(peaks: number[], numBars: number): Float32Array {
  const out = new Float32Array(numBars)
  if (numBars <= 0 || peaks.length === 0) return out
  const bucketSize = peaks.length / numBars
  for (let i = 0; i < numBars; i++) {
    const start = Math.floor(i * bucketSize)
    const end = Math.max(Math.floor((i + 1) * bucketSize), start + 1)
    let max = 0
    for (let j = start; j < end && j < peaks.length; j++) {
      const v = Math.abs(peaks[j] ?? 0)
      if (v > max) max = v
    }
    out[i] = max
  }
  return out
}

// Smooths a resampled peaks array with a weighted moving average so the
// waveform reads as a continuous flow rather than jagged, uncorrelated spikes.
function smoothPeaks(data: Float32Array, radius = 2): Float32Array {
  const n = data.length
  if (n === 0 || radius <= 0) return data
  const kernel: number[] = []
  for (let k = -radius; k <= radius; k++) kernel.push(radius + 1 - Math.abs(k))
  const kernelSum = kernel.reduce((a, b) => a + b, 0)

  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let k = -radius; k <= radius; k++) {
      const idx = Math.min(Math.max(i + k, 0), n - 1)
      sum += data[idx] * kernel[k + radius]
    }
    out[i] = sum / kernelSum
  }
  return out
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return [156, 163, 175] // gray-400 fallback
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

// NEW: Returns a CSS color string from interpolated RGB values.
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string {
  const [r, g, b_] = lerpRgb(a, b, t)
  return `rgb(${r}, ${g}, ${b_})`
}

// Builds a vertical glass-like fill for a bar: a bright highlight right at the
// top (the "light hitting glass" cap), settling into the base color, then
// fading toward transparency at the bottom so it feels translucent rather than
// a flat block of color.
function glassFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  barH: number,
  rgb: [number, number, number]
): CanvasGradient {
  const [r, g, b] = rgb
  const grad = ctx.createLinearGradient(x, y, x, y + barH)
  grad.addColorStop(0, `rgba(255, 255, 255, 0.9)`)
  grad.addColorStop(0.14, `rgba(${r}, ${g}, ${b}, 0.95)`)
  grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.7)`)
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.3)`)
  return grad
}

const BAR_WIDTH = 1
const BAR_GAP = 1
const MIN_BAR_HEIGHT = 2
const SIGMA_BARS = 3.5 // how many neighboring bars the ripple spreads to
const MAX_BOOST_RATIO = 0.55 // extra height, as a fraction of container height, at full boost
const ATTACK = 0.35 // how fast a bar rises toward its target boost
const RELEASE = 0.065 // how slowly it settles back down (creates the "bounce")
const HOVER_INTENSITY = 0.35
const DRAG_INTENSITY = 1

export function FullScreenWaveform({
  media,
  height = 160,
  waveColor = "#9ca3af",
  progressColor = "#2563eb",
  cursorColor = "#1e3a8a",
  playheadColor = "#f97316",
  peaks = null,
  duration,
}: FullScreenWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Refs mirror props/state that the rAF loop needs, so the loop itself
  // doesn't have to be re-created every render (matches the 60fps-via-ref
  // pattern used in StyledWaveform).
  const peaksRef = useRef(peaks)
  const durationRef = useRef(duration)
  const isDraggingRef = useRef(isDragging)
  const dragTimeRef = useRef<number | null>(null)
  const hoverIndexRef = useRef<number | null>(null)
  const hoveringRef = useRef(false)
  const colorsRef = useRef({ waveColor, progressColor, cursorColor, playheadColor })

  peaksRef.current = peaks
  durationRef.current = duration
  isDraggingRef.current = isDragging
  colorsRef.current = { waveColor, progressColor, cursorColor, playheadColor }

  const resampledRef = useRef<Float32Array>(new Float32Array(0))
  const boostCurrentRef = useRef<Float32Array>(new Float32Array(0))
  const boostTargetRef = useRef<Float32Array>(new Float32Array(0))
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(performance.now())

  const numBars = containerWidth > 0 ? Math.max(1, Math.floor(containerWidth / (BAR_WIDTH + BAR_GAP))) : 0

  // Resample whenever peaks or bar count changes, and resize the boost buffers to match.
  useEffect(() => {
    if (!peaks || peaks.length === 0 || numBars === 0) {
      resampledRef.current = new Float32Array(0)
      boostCurrentRef.current = new Float32Array(0)
      boostTargetRef.current = new Float32Array(0)
      return
    }
    resampledRef.current = smoothPeaks(resamplePeaks(peaks, numBars), 2)
    boostCurrentRef.current = new Float32Array(numBars)
    boostTargetRef.current = new Float32Array(numBars)
  }, [peaks, numBars])

  // Track container width via ResizeObserver.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setContainerWidth(Math.round(w))
    })
    ro.observe(el)
    setContainerWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const getTimeFromPointer = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!containerRef.current) return { ratio: 0, time: 0, x: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
      const totalDuration = durationRef.current || media?.duration || 0
      return { ratio, time: ratio * totalDuration, x: e.clientX - rect.left }
    },
    [media]
  )

  // Push new ripple targets whenever the pointer moves, centered on the bar under the cursor.
  const applyRippleTarget = useCallback(
    (x: number, intensity: number) => {
      const bars = boostTargetRef.current
      const n = bars.length
      if (n === 0 || containerWidth === 0) return
      const centerIndex = (x / containerWidth) * n
      hoverIndexRef.current = centerIndex
      const twoSigmaSq = 2 * SIGMA_BARS * SIGMA_BARS
      for (let i = 0; i < n; i++) {
        const d = i - centerIndex
        bars[i] = intensity * Math.exp(-(d * d) / twoSigmaSq)
      }
    },
    [containerWidth]
  )

  const clearRippleTarget = useCallback(() => {
    boostTargetRef.current.fill(0)
    hoverIndexRef.current = null
  }, [])

  // --- Main render loop ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const w = containerWidth
      const h = height
      if (w === 0 || h === 0) return

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const bars = resampledRef.current
      const boostCurrent = boostCurrentRef.current
      const boostTarget = boostTargetRef.current
      const n = bars.length
      if (n === 0) return

      const totalDuration = durationRef.current || media?.duration || 0
      const currentTime = isDraggingRef.current
        ? dragTimeRef.current ?? media?.currentTime ?? 0
        : media?.currentTime ?? 0
      const progressRatio = totalDuration > 0 ? Math.min(currentTime / totalDuration, 1) : 0
      const progressX = progressRatio * w

      const { waveColor: wc, progressColor: pc, cursorColor: cc, playheadColor: phc } = colorsRef.current
      const waveRgb = hexToRgb(wc.startsWith("#") ? wc : "#9ca3af")
      const progressRgb = hexToRgb(pc.startsWith("#") ? pc : "#2563eb")
      const cursorRgb = hexToRgb(cc.startsWith("#") ? cc : "#1e3a8a")

      const elapsed = (performance.now() - startRef.current) / 1000
      const step = BAR_WIDTH + BAR_GAP
      const midY = h / 2
      const maxBoostPx = h * MAX_BOOST_RATIO
      // The single bar sitting right at "now" — marked in playheadColor so the
      // exact current position reads distinctly from the played/unplayed fill.
      const playheadIndex = Math.min(n - 1, Math.max(0, Math.round((progressX / step))))

      for (let i = 0; i < n; i++) {
        // Spring toward the target boost: fast attack, slow release, for a bouncy settle.
        const target = boostTarget[i] ?? 0
        const cur = boostCurrent[i] ?? 0
        const rate = target > cur ? ATTACK : RELEASE
        boostCurrent[i] = cur + (target - cur) * rate

        const boost = boostCurrent[i]
        const amp = bars[i]
        let barH = Math.max(amp * h, MIN_BAR_HEIGHT)

        // Subtle shimmer on actively boosted bars, like SoundCloud's live ripple.
        if (boost > 0.02) {
          const shimmer = Math.sin(elapsed * 10 + i * 0.4) * 0.15 * boost
          barH += boost * maxBoostPx * (1 + shimmer)
        }
        barH = Math.min(barH, h)

        const x = i * step
        const isPlayed = x < progressX
        let color: string
        if (boost > 0.02) {
          const t = Math.min(boost, 1)
          const base = isPlayed ? progressRgb : waveRgb
          // Now lerpColor is defined and returns a CSS color string
          color = lerpColor(base, cursorRgb, t)
        } else if (i === playheadIndex) {
          color = phc
        } else {
          color = isPlayed ? pc : wc
        }

        ctx.fillStyle = color
        const radius = Math.min(BAR_WIDTH / 2, barH / 2)
        const y = midY - barH / 2
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, BAR_WIDTH, barH, radius)
        } else {
          ctx.rect(x, y, BAR_WIDTH, barH)
        }
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [containerWidth, height, media])

  // --- Pointer handlers ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!media) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    const { time, x } = getTimeFromPointer(e)
    dragTimeRef.current = time
    media.currentTime = time
    setHoverTime(time)
    setHoverX(x)
    applyRippleTarget(x, DRAG_INTENSITY)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { time, x } = getTimeFromPointer(e)
    setHoverX(x)
    setHoverTime(time)
    hoveringRef.current = true

    if (isDragging && media) {
      dragTimeRef.current = time
      media.currentTime = time
      applyRippleTarget(x, DRAG_INTENSITY)
    } else {
      applyRippleTarget(x, HOVER_INTENSITY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      dragTimeRef.current = null
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    }
  }

  const handlePointerLeave = () => {
    hoveringRef.current = false
    if (!isDragging) {
      setHoverTime(null)
      clearRippleTarget()
    }
  }

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!media) return
      if (e.key === "ArrowRight") media.currentTime = Math.min(media.currentTime + 5, media.duration || Infinity)
      if (e.key === "ArrowLeft") media.currentTime = Math.max(media.currentTime - 5, 0)
    },
    [media]
  )

  if (!peaks || peaks.length === 0) {
    return (
      <div className="w-full flex items-center" style={{ height }}>
        <div className="w-full h-1 bg-muted rounded-full" />
      </div>
    )
  }

  return (
    <div className="relative w-full select-none group">
      <div
        ref={containerRef}
        tabIndex={0}
        role="slider"
        aria-label="Seek"
        aria-valuemax={media?.duration || 0}
        aria-valuenow={media?.currentTime || 0}
        onKeyDown={onKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`w-full relative z-10 ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
        style={{ touchAction: "none", height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        />
      </div>

      {/* Dynamic Hover/Drag Timestamp Tooltip */}
      {hoverTime !== null && (
        <div
          className={`absolute -top-8 z-30 px-2 py-0.5 text-xs font-semibold text-white rounded pointer-events-none -translate-x-1/2 transition-all duration-75 ${
            isDragging ? "scale-110 shadow-md" : "bg-black/90"
          }`}
          style={{ left: hoverX, backgroundColor: isDragging ? cursorColor : undefined }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  )
}