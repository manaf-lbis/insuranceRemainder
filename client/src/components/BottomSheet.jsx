import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const BottomSheet = ({ isOpen, onClose, title, children }) => {
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setAnimate(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setAnimate(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen && !animate) return null

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Sheet */}
            <div
                className={`bg-white w-full rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 font-poppins">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
}

export default BottomSheet
