"use client"

import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"

interface WaveformProps {
    audioUrl: string
    media?: HTMLMediaElement | null
    height?: number
    waveColor?: string
    progressColor?: string
}

export function Waveform({
    audioUrl,
    media,
    height = 64,
    waveColor = "#9ca3af", // text-muted-foreground
    progressColor = "#2563eb" // primary (blue-600 approx)
}: WaveformProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const wavesurfer = useRef<WaveSurfer | null>(null)

    useEffect(() => {
        if (!containerRef.current || !media) return

        const options = {
            container: containerRef.current,
            waveColor: waveColor,
            progressColor: progressColor,
            url: audioUrl,
            media: media,
            height: height,
            barWidth: 2,
            barGap: 2,
            barRadius: 2,
            cursorWidth: 0,
            normalize: true,
            backend: 'MediaElement', // Use MediaElement backend for better performance with large files
            fetchParams: {
                cache: 'force-cache', // Try to use browser cache
            },
        }

        try {
            wavesurfer.current = WaveSurfer.create(options as any)

            wavesurfer.current.on('error', (err) => {
                console.error("WaveSurfer error:", err)
            })
        } catch (err) {
            console.error("Failed to initialize WaveSurfer:", err)
        }

        return () => {
            wavesurfer.current?.destroy()
        }
    }, [audioUrl, media, height, waveColor, progressColor])

    return <div ref={containerRef} className="w-full" />
}
