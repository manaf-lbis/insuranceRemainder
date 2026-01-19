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
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Download size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Install App</h3>
                                <p className="text-sm text-blue-100">Quick access from your home screen</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">
                        Install this app for quick access and a better experience. Works offline and loads faster!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-blue-900 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-lg"
                        >
                            Install Now
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
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
