import React, { useState, useEffect } from 'react'
import { Lock, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../features/auth/authSlice'
import { useLoginMutation } from '../features/auth/authApiSlice'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { user } = useSelector((state) => state.auth)
    const [login, { isLoading }] = useLoginMutation()

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')

        try {
            const userData = await login({ username, password }).unwrap()
            dispatch(setCredentials({ ...userData }))
            setUsername('')
            setPassword('')
            navigate('/dashboard') // Assuming dashboard route exists, otherwise just stay for now or alert
            console.log("Logged in successfully:", userData);
        } catch (err) {
            console.error('Login failed:', err)
            if (!err.status) {
                setErrorMsg('No Server Response')
            } else if (err.status === 400 || err.status === 401) {
                setErrorMsg('Invalid Username or Password')
            } else {
                setErrorMsg('Login Failed')
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-primary">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/appIcon.png"
                            alt="CSC Logo"
                            className="h-20 w-20 rounded-xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">CSC Insurance Tracker</h1>
                    <p className="text-gray-500 text-sm mt-1">Staff Access Only</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                placeholder="Enter your user ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    Authorized personnel only. All actions are logged.
                </div>
            </div>
        </div>
    )
}

export default LoginPage
