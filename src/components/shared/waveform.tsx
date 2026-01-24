"use client"

import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"

interface WaveformProps {
    audioUrl: string
    media?: HTMLMediaElement | null
    height?: number
    waveColor?: string
    progressColor?: string
    peaks?: number[] | null // Pre-computed waveform peaks
    duration?: number // Explicit duration for interaction
}

export function Waveform({
    audioUrl,
    media,
    height = 64,
    waveColor = "#9ca3af", // text-muted-foreground
    progressColor = "#2563eb", // primary (blue-600 approx)
    peaks = null,
    duration
}: WaveformProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const wavesurfer = useRef<WaveSurfer | null>(null)

    useEffect(() => {
        if (!containerRef.current || !media) return

        // If no peaks available, show simple progress bar instead
        if (!peaks || peaks.length === 0) {
            console.warn('No waveform peaks available for this track')
            return
        }

        console.log('Waveform mounting', { media: !!media, peaksLength: peaks?.length, duration })

        const options = {
            container: containerRef.current,
            waveColor: waveColor,
            progressColor: progressColor,

            cursorWidth: 1, // Show cursor for visual feedback
            cursorColor: progressColor,
            normalize: true,
            interact: true, // Ensure interaction is enabled
            height: height,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            // Use pre-computed peaks - no URL needed!
            peaks: [peaks], // WaveSurfer expects array of channels
            duration: duration || media.duration || 1, // Fallback duration to prevent div/0
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wavesurfer.current = WaveSurfer.create(options as any)

            wavesurfer.current.on('error', (err) => {
                console.error("WaveSurfer error:", err)
            })

            // Handle seeking manually
            wavesurfer.current.on('interaction', (newTime) => {
                if (media && Number.isFinite(newTime)) {
                    media.currentTime = newTime
                }
            })

            // Sync WaveSurfer with audio playback
            const onTimeUpdate = () => {
                if (wavesurfer.current && media.currentTime) {
                    wavesurfer.current.setTime(media.currentTime)
                }
            }

            // If duration changes (e.g. metadata loaded), update wavesurfer
            const onDurationChange = () => {
                if (wavesurfer.current && media.duration) {
                    wavesurfer.current.setOptions({ duration: media.duration })
                }
            }

            media.addEventListener('timeupdate', onTimeUpdate)
            media.addEventListener('durationchange', onDurationChange)

            return () => {
                media.removeEventListener('timeupdate', onTimeUpdate)
                media.removeEventListener('durationchange', onDurationChange)
                wavesurfer.current?.destroy()
            }
        } catch (err) {
            console.error("Failed to initialize WaveSurfer:", err)
        }
    }, [audioUrl, media, height, waveColor, progressColor, peaks, duration])

    // Show simple progress bar if no peaks
    if (!peaks || peaks.length === 0) {
        return (
            <div ref={containerRef} className="w-full h-16 flex items-center">
                <div className="w-full h-1 bg-muted rounded-full" />
            </div>
        )
    }

    return <div ref={containerRef} className="w-full h-full relative z-10" />
}
