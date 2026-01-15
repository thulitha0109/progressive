"use client"

import { AppProgressBar as ProgressBar } from "next-nprogress-bar"
import { ReactNode } from "react"

const ProgressProvider = ({ children }: { children: ReactNode }) => {
    return (
        <>
            {children}
            <ProgressBar
                height="4px"
                color="hsl(var(--primary))"
                options={{ showSpinner: false }} // We will control visibility via CSS
                shallowRouting
                style="" // Disable default styles if possible, but nprogress usually injects them. We'll override in globals.css
            />
        </>
    )
}

export default ProgressProvider
