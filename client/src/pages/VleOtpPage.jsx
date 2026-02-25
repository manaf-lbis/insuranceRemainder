import React, { useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, ShieldCheck, RefreshCcw } from 'lucide-react'
import { useVleVerifyOtpMutation, useVleResendOtpMutation } from '../features/vle/vleAuthApiSlice'

const VleOtpPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { userId, email } = location.state || {}

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const inputRefs = useRef([])

    const [verifyOtp, { isLoading: isVerifying }] = useVleVerifyOtpMutation()
    const [resendOtp, { isLoading: isResending }] = useVleResendOtpMutation()

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        setError('')
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(''))
        }
    }

    const handleVerify = async () => {
        const otpCode = otp.join('')
        if (otpCode.length !== 6) return setError('Please enter the 6-digit OTP')
        try {
            await verifyOtp({ userId, otp: otpCode }).unwrap()
            navigate('/login', { state: { verified: true } })
        } catch (err) {
            setError(err?.data?.message || 'Invalid OTP. Please try again.')
        }
    }

    const handleResend = async () => {
        try {
            await resendOtp({ userId }).unwrap()
            setSuccess('A new OTP has been sent to your email.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (err) {
            setError(err?.data?.message || 'Failed to resend OTP.')
        }
    }

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-blue-900 p-4">
                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-sm w-full">
                    <p className="text-gray-600 mb-6 font-medium">Invalid session or session expired.</p>
                    <Link to="/vle/signup" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-800 transition-all">
                        Please Sign Up Again
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-blue-900 p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Back Button */}
                <Link
                    to="/vle/signup"
                    className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors duration-200 group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="text-sm font-medium">Back to Registration</span>
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
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verify Email</h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium">
                            We've sent a 6-digit verification code to
                        </p>
                        <p className="text-primary font-bold text-sm truncate px-4">{email}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                            <span className="font-semibold mr-2 mt-0.5">!</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck className="h-4 w-4 mr-2 mt-0.5" />
                            {success}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-full h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Verify Account'}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium mb-2">Didn't receive the code?</p>
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="inline-flex items-center gap-2 text-primary font-bold hover:text-blue-700 transition-colors disabled:text-gray-400"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                                {isResending ? 'Resending...' : 'Resend Verification Code'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                            Secure Verification • Notify CSC Authorization
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VleOtpPage
