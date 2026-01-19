import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => {
    if (!isOpen) return null;

    const getBtnStyles = () => {
        return variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-900 hover:bg-blue-800';
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <AlertCircle className={variant === 'danger' ? 'text-red-600' : 'text-blue-600'} size={24} />
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 rounded-xl text-white font-semibold transition-all shadow-lg active:scale-95 ${getBtnStyles()}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
