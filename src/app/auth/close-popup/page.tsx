"use client";

import { useEffect } from "react";

export default function ClosePopupPage() {
    useEffect(() => {
        // This will close the popup tab immediately when loaded
        if (window.opener) {
            window.opener.postMessage("oauth-login-success", window.location.origin);
            window.close();
        } else {
            // Fallback if somehow not opened as a popup
            window.location.href = "/profile";
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-vh-100 p-8 text-center text-sm text-muted-foreground animate-enter-fade-in">
            <p>Authentication complete. You can close this window now if it didn't close automatically.</p>
        </div>
    );
}
