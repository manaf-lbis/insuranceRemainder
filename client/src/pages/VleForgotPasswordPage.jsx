import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, ShieldCheck, Key, RefreshCcw } from 'lucide-react'
import { useVleForgotPasswordMutation, useVleResetPasswordMutation } from '../features/vle/vleAuthApiSlice'

const VleForgotPasswordPage = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1=email, 2=otp+newpass
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')

    const [forgotPassword, { isLoading: isSending }] = useVleForgotPasswordMutation()
    const [resetPassword, { isLoading: isResetting }] = useVleResetPasswordMutation()

    const handleSendOtp = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const res = await forgotPassword({ email }).unwrap()
            setMsg(res.message)
            if (res.userId) {
                setUserId(res.userId)
                setStep(2)
            }
        } catch (err) {
            setError(err?.data?.message || 'Failed to send OTP. Please check your email.')
        }
    }

    const handleReset = async (e) => {
        e.preventDefault()
        setError('')
        if (newPassword !== confirmPassword) return setError('Passwords do not match')
        try {
            await resetPassword({ userId, otp, newPassword }).unwrap()
            navigate('/login', { state: { reset: true } })
        } catch (err) {
            setError(err?.data?.message || 'Failed to reset password. Check your OTP.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-blue-900 p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
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
                                <div className="h-16 w-16 flex items-center justify-center bg-primary/10 rounded-xl text-primary">
                                    <Key className="h-8 w-8" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-white">
                                    <ShieldCheck className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium px-4">
                            {step === 1
                                ? 'No worries! Enter your email and we\'ll send you an OTP.'
                                : `Verify the code sent to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                            <span className="font-semibold mr-2 mt-0.5">!</span>
                            {error}
                        </div>
                    )}

                    {msg && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck className="h-4 w-4 mr-2 mt-0.5" />
                            {msg}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <span className="flex items-center">
                                        <RefreshCcw className="animate-spin h-5 w-5 mr-3" />
                                        Sending Code...
                                    </span>
                                ) : 'Send Verification Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">6-Digit OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white tracking-[0.5em] text-center font-bold text-xl transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                        placeholder="Repeat your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isResetting}
                                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isResetting ? (
                                    <span className="flex items-center">
                                        <RefreshCcw className="animate-spin h-5 w-5 mr-3" />
                                        Resetting...
                                    </span>
                                ) : 'Reset Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-gray-500 text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest mt-2"
                            >
                                Resend or Change Email
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Notify CSC Security Management
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VleForgotPasswordPage
