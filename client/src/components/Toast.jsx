import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, duration, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/90',
                    border: 'border-green-400',
                    icon: <CheckCircle className="text-white" size={20} />
                };
            case 'error':
                return {
                    bg: 'bg-red-500/90',
                    border: 'border-red-400',
                    icon: <AlertCircle className="text-white" size={20} />
                };
            default:
                return {
                    bg: 'bg-blue-600/90',
                    border: 'border-blue-400',
                    icon: <Info className="text-white" size={20} />
                };
        }
    };

    const styles = getStyles();

    return (
        <div
            className={`
                min-w-[300px] max-w-md p-4 rounded-lg shadow-2xl border backdrop-blur-md
                flex items-start gap-3 transition-all duration-300 transform
                ${styles.bg} ${styles.border}
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                animate-in slide-in-from-right
            `}
        >
            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
            <div className="flex-grow text-white font-medium text-sm leading-tight">
                {message}
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
