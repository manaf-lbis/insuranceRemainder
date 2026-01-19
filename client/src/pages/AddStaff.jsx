import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegisterUserMutation } from '../features/users/usersApiSlice'
import { ChevronLeft } from 'lucide-react'
import { useToast } from '../components/ToastContext'

const AddStaff = () => {
    const navigate = useNavigate()
    const [registerUser, { isLoading }] = useRegisterUserMutation()
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        mobileNumber: '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await registerUser(formData).unwrap()
            showToast({ message: 'Staff created successfully!', type: 'success' })
            navigate('/admin/staff')
        } catch (err) {
            showToast({ message: 'Failed to create staff: ' + (err.data?.message || err.message), type: 'error' })
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/admin/staff')} className="mr-3 text-gray-600 hover:text-gray-900">
                    <ChevronLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Add New Staff</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username / Staff ID</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        pattern="[0-9]{10}"
                        title="10 digit mobile number"
                        required
                        className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Initial Password</label>
                    <input
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-400 font-medium transition-colors"
                >
                    {isLoading ? 'Creating...' : 'Create Staff Account'}
                </button>
            </form>
        </div>
    )
}

export default AddStaff
