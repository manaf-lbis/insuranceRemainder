import React, { useState } from 'react';
import { MessageCircle, Users, X, MessageSquare } from 'lucide-react';

const WhatsAppButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const phoneNumber = '919633565414'; // Format: country code + number without + or spaces
    const message = 'Hello! I would like to inquire about your services.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    const groupUrl = 'https://chat.whatsapp.com/JsHUGQMTjoM9E4yOdUH3lN';

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Options Menu */}
            <div
                className={`flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${
                    isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
                }`}
            >
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 group/item min-w-[200px]"
                >
                    <div className="bg-green-100 p-2 rounded-full group-hover/item:bg-green-200 transition-colors">
                        <MessageSquare size={20} className="text-green-600" />
                    </div>
                    <span className="font-medium">Chat with us</span>
                </a>

                <a
                    href={groupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 group/item min-w-[200px]"
                >
                    <div className="bg-green-100 p-2 rounded-full group-hover/item:bg-green-200 transition-colors">
                        <Users size={20} className="text-green-600" />
                    </div>
                    <span className="font-medium">Join WhatsApp Group</span>
                </a>
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group relative ${
                    isOpen ? 'bg-gray-700 hover:bg-gray-800 rotate-45' : ''
                }`}
                aria-label="Toggle chat options"
            >
                {isOpen ? (
                    <X size={24} className="transition-transform duration-300" />
                ) : (
                    <>
                        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    </>
                )}
            </button>
        </div>
    );
};

export default WhatsAppButton;
