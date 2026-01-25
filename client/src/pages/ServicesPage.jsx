import React from 'react';
import { Link } from 'react-router-dom';
import {
    Building2, Zap, Globe, Briefcase, Heart,
    ShieldCheck, GraduationCap, Laptop, Landmark
} from 'lucide-react';
import Navbar from '../components/Navbar';

const ServiceCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
        <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 font-poppins">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
);

const ServicesPage = () => {
    const services = [
        {
            icon: Building2,
            title: "G2C Services",
            description: "Direct access to Government-to-Citizen portals, including certificate issuance, application tracking, and official registrations.",
            color: "blue"
        },
        {
            icon: Briefcase,
            title: "B2C Services",
            description: "A wide range of Business-to-Citizen services including insurance renewals, utility payments, and commercial digital solutions.",
            color: "emerald"
        },
        {
            icon: Zap,
            title: "Digital India",
            description: "Frontline delivery point for various Government initiatives aimed at making India a digitally empowered society.",
            color: "orange"
        },
        {
            icon: Landmark,
            title: "Financial Services",
            description: "Assistance with banking operations (DigiPay), insurance (Life & General), and micro-financial initiatives.",
            color: "rose"
        },
        {
            icon: GraduationCap,
            title: "Education & Skills",
            description: "Registration and support for PMGDISHA, NIELIT courses, and various skill development programmes.",
            color: "indigo"
        },
        {
            icon: Laptop,
            title: "IT & Tech Support",
            description: "Assistance with hardware/software procurement, digital signature certificates, and general technology consulting.",
            color: "slate"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar variant="solid" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Our Portfolio</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 font-poppins tracking-tighter">
                        <span className="text-blue-600 italic">Notify CSC</span> Services
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        We offer a comprehensive suite of e-Services designed to bring government and business solutions within the reach of every citizen.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-32 bg-slate-900 rounded-[48px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 font-poppins tracking-tight">Need a Specific <span className="text-blue-500 italic">Service?</span></h2>
                        <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">
                            Enquire about our G2C and B2C solutions today or visit our center for personalized digital assistance.
                        </p>
                        <Link to="/check-insurance" className="inline-flex items-center h-14 px-10 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                            Submit Enquiry 🚀
                        </Link>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>
            </main>
        </div>
    );
};

export default ServicesPage;
