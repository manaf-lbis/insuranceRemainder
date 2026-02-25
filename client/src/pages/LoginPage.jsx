import React, { useState, useEffect } from 'react'
import { Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setCredentials } from '../features/auth/authSlice'
import { useLoginMutation } from '../features/auth/authApiSlice'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const location = useLocation()

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { user } = useSelector((state) => state.auth)
    const [login, { isLoading }] = useLoginMutation()

    useEffect(() => {
        if (location.state?.verified) {
            setInfoMsg('Email verified successfully! Your account is now pending Admin approval. We will notify you once you are cleared to login.')
            // Clear location state to prevent message from persisting on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location])

    useEffect(() => {
        if (user) {
            if (['vle', 'akshaya'].includes(user.role)) {
                navigate('/vle/dashboard')
            } else {
                navigate('/dashboard')
            }
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')
        setInfoMsg('')

        try {
            const userData = await login({ username, password }).unwrap()
            dispatch(setCredentials({ ...userData }))
            setUsername('')
            setPassword('')

            // Redirect based on role
            if (['vle', 'akshaya'].includes(userData.role)) {
                navigate('/vle/dashboard')
            } else {
                navigate('/dashboard')
            }
            console.log("Logged in successfully:", userData);
        } catch (err) {
            console.error('Login failed:', err)
            if (err?.data?.needsVerification) {
                // Redirect to OTP page for operators who haven't verified email
                navigate('/vle/verify-otp', {
                    state: { userId: err.data.userId, email: err.data.email || username },
                })
            } else if (err?.data?.pendingApproval) {
                setInfoMsg(err?.data?.message || 'Your account is pending admin approval.')
            } else if (!err.status) {
                setErrorMsg('No Server Response')
            } else {
                setErrorMsg(err?.data?.message || 'Invalid Username or Password')
            }
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
                    to="/"
                    className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors duration-200 group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="text-sm font-medium">Back to Home Search</span>
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
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Login Portal</h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Please sign in to your CSC account</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <span className="font-bold mr-2 mt-0.5">!</span>
                            <div className="flex-1 font-medium">{errorMsg}</div>
                        </div>
                    )}

                    {infoMsg && (
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <ShieldCheck className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 font-medium">{infoMsg}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Username / Email / Mobile</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                    placeholder="Enter your user ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="absolute right-3 top-3">
                                    <Link to="/vle/forgot-password" size="sm" className="text-primary hover:text-blue-700 text-xs font-semibold">
                                        Forgot?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : 'Sign In to Dashboard'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            New Operator? <Link to="/vle/signup" className="text-primary font-bold hover:underline">Create an account</Link>
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-4 uppercase">
                            AUTHORIZED PERSONNEL ONLY • ALL ACTIONS LOGGED
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
