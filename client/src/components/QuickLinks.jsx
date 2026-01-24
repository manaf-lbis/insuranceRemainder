import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Briefcase, MapPin, Info, ChevronRight } from 'lucide-react';

const QuickLinks = () => {
    const links = [
        {
            title: "Check insurance validity",
            icon: ShieldCheck,
            to: "/check-insurance",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600"
        },
        {
            title: "Our Services",
            icon: Briefcase,
            to: "/services",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600"
        },
        {
            title: "Locate Center",
            icon: MapPin,
            to: "https://maps.app.goo.gl/4LzQ3nEsKHdfWZJY9",
            external: true,
            iconBg: "bg-rose-50",
            iconColor: "text-rose-600"
        },
        {
            title: "About Us",
            icon: Info,
            to: "/about",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600"
        }
    ];

    return (
        <section className="bg-blue-800 py-10 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8 font-poppins">
                    Quick Services
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {links.map((link, idx) => {
                        const Icon = link.icon;
                        const content = (
                            <div className="flex items-center p-3 sm:p-4 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 group h-full border border-white/10">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg ${link.iconBg} ${link.iconColor} flex items-center justify-center mr-3 sm:mr-4 transition-transform group-hover:scale-105 duration-300`}>
                                    <Icon size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <span className="flex-1 text-[11px] sm:text-sm font-bold text-slate-700 font-poppins leading-tight pr-2">
                                    {link.title}
                                </span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                        );

                        if (link.external) {
                            return (
                                <a
                                    key={idx}
                                    href={link.to}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block h-full no-underline"
                                >
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <Link key={idx} to={link.to} className="block h-full no-underline">
                                {content}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default QuickLinks;
