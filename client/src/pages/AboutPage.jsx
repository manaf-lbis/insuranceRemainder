import Navbar from '../components/Navbar';
import {
    Shield, Target, Users, Heart, Zap,
    Building2, Briefcase, Landmark, GraduationCap, Laptop
} from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
        <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 font-poppins">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
);

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar variant="solid" />

            <main className="flex-grow">
                {/* Hero Header */}
                <header className="bg-white border-b border-slate-100 py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Our Vision</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-poppins tracking-tighter mb-6">
                            Bridging the <span className="text-blue-600 italic">Digital Divide</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
                            Common Services Centres (CSC) are the essential access points for delivery of Government-to-Citizen (G2C) and Business-to-Citizen (B2C) e-Services directly to the reach of the citizen.
                        </p>
                    </div>
                </header>

                {/* Core Pillars */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Shield,
                                    title: "G2C Services",
                                    desc: "Government-to-Citizen services providing transparent and efficient access to essential state and central portals.",
                                    color: "blue"
                                },
                                {
                                    icon: Target,
                                    title: "B2C Services",
                                    desc: "Business-to-Citizen services delivering professional commercial utility and digital solutions to local communities.",
                                    color: "emerald"
                                },
                                {
                                    icon: Zap,
                                    title: "Digital India",
                                    desc: "Serving as frontline delivery points for Digital India initiatives, ensuring every citizen is empowered by technology.",
                                    color: "orange"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
                                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`text-${item.color}-600`} size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 font-poppins tracking-tight">{item.title}</h3>
                                    <p className="text-slate-500 text-base leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Digital Services Hub - Merged from Services Page */}
                <section className="py-24 bg-slate-100/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Digital Registry</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 font-poppins tracking-tighter">
                                <span className="text-blue-600 italic">Notify CSC</span> Services
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                                Comprehensive e-Services designed to bring government and business solutions within the reach of every citizen.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
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
                            ].map((service, index) => (
                                <ServiceCard key={index} {...service} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="pb-32">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="bg-white p-12 rounded-[48px] shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16"></div>

                            <h2 className="text-3xl font-black text-slate-900 mb-8 font-poppins tracking-tight">Access Points for Digital Empowerment</h2>
                            <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 font-medium">
                                <p>
                                    Common Services Centres (CSC) are a strategic pillar of the Digital India programme. They are the access points for delivery of various electronic services to villages in India, thereby contributing to a digitally and financially inclusive society.
                                </p>
                                <p>
                                    Our portal serves as a unified platform where citizens can enquire and learn about various <strong>Government-to-Citizen (G2C)</strong> and <strong>Business-to-Citizen (B2C)</strong> e-Services. We are committed to bringing the benefits of the digital revolution to the doorstep of every citizen.
                                </p>
                                <p>
                                    From utility payments and educational registrations to government certifications and welfare scheme guidance, Notify CSC act as the primary interface for citizens to interact with the digital ecosystem of modern India.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm mb-3">&copy; {new Date().getFullYear()} Notify CSC. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
