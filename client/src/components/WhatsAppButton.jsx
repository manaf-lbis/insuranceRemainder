import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const phoneNumber = '919633565414'; // Format: country code + number without + or spaces
    const message = 'Hello! I would like to inquire about your services.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </a>
    );
};

export default WhatsAppButton;
