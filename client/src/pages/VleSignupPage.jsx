import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Store, Lock, ShieldCheck } from 'lucide-react'
import { useVleSignupMutation } from '../features/vle/vleAuthApiSlice'

const VleSignupPage = () => {
    const navigate = useNavigate()
    const [vleSignup, { isLoading }] = useVleSignupMutation()

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        mobileNumber: '', shopName: '', role: 'vle',
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Basic pattern validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            return setError('Please enter a valid email format.');
        }

        // Dummy Email check
        const BLOCKED_DOMAINS = [
            // Standard Dummy/Temp Mail Domains
            'temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
            'yopmail.com', 'throwawaymail.com', 'tempmail.com', 'getnada.com',
            'mytemp.email', 'dropmail.me', 'dispostable.com', 'maildrop.cc',
            'temp-mail.io', 'mailnesia.com', 'minuteinbox.com', 'tempmailo.com',
            'mohmal.com', 'tempinbox.com', 'sharklasers.com', 'tempail.com',
            'tempail.org', 'trashmail.com', 'inbox.lv', '10minutemail.net',

            // Random Generators / Burners
            'generator.email', 'email-fake.com', 'fake-mail.net', 'fakemail.net',
            'crazymailing.com', 'trash-mail.com', 'bouncr.com', 'spamgourmet.com',
            '33mail.com', 'anonbox.net', 'anonymbox.com', 'mailcatch.com',
            'mailcatch.net', 'mailinc.com', 'maildrop.mobi', 'mailnull.com'
        ];
        const domain = form.email.split('@')[1]?.toLowerCase();
        if (BLOCKED_DOMAINS.includes(domain)) {
            return setError('Temporary or dummy email addresses are not permitted.');
        }

        if (form.mobileNumber && !/^[0-9]{10}$/.test(form.mobileNumber)) {
            return setError('Please enter a valid 10-digit mobile number.');
        }

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match')
        }
        try {
            const res = await vleSignup({
                name: form.name,
                email: form.email,
                password: form.password,
                mobileNumber: form.mobileNumber,
                shopName: form.shopName,
                role: form.role,
            }).unwrap()
            navigate('/vle/verify-otp', { state: { userId: res.userId, email: res.email } })
        } catch (err) {
            setError(err?.data?.message || 'Signup failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-blue-900 p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-2xl z-10 py-8">
                {/* Back Button */}
                <Link
                    to="/login"
                    className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors duration-200 group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="text-sm font-medium">Back to Login</span>
                </Link>

                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm relative">
                                <img
                                    src="/appIcon.jpg"
                                    alt="Notify CSC Logo"
                                    className="h-16 w-16 rounded-xl object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/64?text=CSC";
                                    }}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-white">
                                    <ShieldCheck className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Operator Account</h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Join Notify CSC as a VLE or Akshaya Operator</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                            <span className="font-semibold mr-2 mt-0.5">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Registration Role</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium"
                                >
                                    <option value="vle">VLE (Village Level Entrepreneur)</option>
                                    <option value="akshaya">Akshaya Operator</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Full Name *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Email Address *</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Mobile Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={form.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                    placeholder="10-digit number"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Shop / Centre Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Store className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={form.shopName}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                    placeholder="Your shop or centre name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Password *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Confirm Password *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : 'Register & Send Verification Code'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default VleSignupPage
