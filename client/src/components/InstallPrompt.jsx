import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem('installPromptDismissed')
        if (dismissed) return

        // Listen for the beforeinstallprompt event
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        localStorage.setItem('installPromptDismissed', 'true')
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Download size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">Install App</h3>
                                <p className="text-blue-100">Quick access from your home screen</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-6 text-base leading-relaxed">
                        Install this app for quick access, offline capabilities, and a better experience. It takes almost no space!
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-blue-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-800 transition-all hover:scale-[1.02] shadow-lg border border-transparent"
                        >
                            Install Now
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstallPrompt
