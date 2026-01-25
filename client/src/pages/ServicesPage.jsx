import Navbar from '../components/Navbar';

const ServiceCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const ServicesPage = () => {
    const services = [
        {
            icon: Car,
            title: "Private Car Insurance",
            description: "Comprehensive coverage for your personal vehicles. Protection against accidents, theft, and third-party liabilities."
        },
        {
            icon: Bike,
            title: "Two-Wheeler Insurance",
            description: "Essential protection for bikes and scooters. Quick renewals and long-term policies available."
        },
        {
            icon: Truck,
            title: "Commercial Vehicle Insurance",
            description: "Robust insurance plans for goods carrying vehicles, heavy trucks, and passenger commercial vehicles."
        },
        {
            icon: Shield,
            title: "Third-Party Liability",
            description: "Mandatory legal coverage to protect you against financial liability for damage to third-party properties."
        },
        {
            icon: FileText,
            title: "Renewal Services",
            description: "Hassle-free instant renewals for expired or expiring policies with minimal paperwork."
        },
        {
            icon: CheckCircle,
            title: "Claim Assistance",
            description: " dédié support to help you navigate through the claim settlement process efficiently."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar variant="solid" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 font-poppins">Our Services</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We provide a full spectrum of insurance solutions tailored to your needs. Fast, reliable, and secure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 bg-blue-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get insured?</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                            Contact us today or visit our center for quick processing.
                        </p>
                        <Link to="/check-insurance" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-colors">
                            Check Status First
                        </Link>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
            </main>
        </div>
    );
};

export default ServicesPage;
