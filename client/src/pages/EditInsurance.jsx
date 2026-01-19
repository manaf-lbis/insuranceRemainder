import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetInsuranceByIdQuery, useUpdateInsuranceMutation } from '../features/insurance/insuranceApiSlice'
import { useToast } from '../components/ToastContext'
import Input from '../components/Input'
import Select from '../components/Select'
import { ChevronLeft, Loader } from 'lucide-react'

const initialFormState = {
    registrationNumber: '',
    customerName: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    vehicleType: '',
    insuranceType: '',
    policyStartDate: '',
    policyExpiryDate: '',
    duration: '',
    remarks: '',
}

const EditInsurance = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { showToast } = useToast()

    const { data: insurance, isLoading: isFetching, isError } = useGetInsuranceByIdQuery(id)
    const [updateInsurance, { isLoading }] = useUpdateInsuranceMutation()

    const calculateExpiryDate = (startDate, duration) => {
        if (!startDate || !duration || duration === 'Custom') return ''

        const d = new Date(startDate)
        const years = parseInt(duration.split(' ')[0])
        d.setFullYear(d.getFullYear() + years)
        d.setDate(d.getDate() - 1)
        return d.toISOString().split('T')[0]
    }

    const [formData, setFormData] = useState(initialFormState)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')

    // Load existing data when insurance is fetched
    useEffect(() => {
        if (insurance) {
            setFormData({
                registrationNumber: insurance.registrationNumber || '',
                customerName: insurance.customerName || '',
                mobileNumber: insurance.mobileNumber || '',
                alternateMobileNumber: insurance.alternateMobileNumber || '',
                vehicleType: insurance.vehicleType || '',
                insuranceType: insurance.insuranceType || '',
                policyStartDate: insurance.policyStartDate ? new Date(insurance.policyStartDate).toISOString().split('T')[0] : '',
                policyExpiryDate: insurance.policyExpiryDate ? new Date(insurance.policyExpiryDate).toISOString().split('T')[0] : '',
                duration: insurance.duration || '1 Year',
                remarks: insurance.remarks || '',
            })
        }
    }, [insurance])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => {
            const newState = { ...prev, [name]: value }

            // Auto-calculate expiry when start date or duration changes
            if (name === 'policyStartDate' || name === 'duration') {
                const startDate = name === 'policyStartDate' ? value : prev.policyStartDate
                const duration = name === 'duration' ? value : prev.duration

                // Only auto-calculate if duration is not Custom
                if (duration !== 'Custom') {
                    newState.policyExpiryDate = calculateExpiryDate(startDate, duration)
                }
            }

            return newState
        })
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration Number is required'
        if (!formData.customerName) newErrors.customerName = 'Customer Name is required'
        if (!formData.mobileNumber) {
            newErrors.mobileNumber = 'Mobile Number is required'
        } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Must be 10 digits'
        }
        if (formData.alternateMobileNumber && !/^[0-9]{10}$/.test(formData.alternateMobileNumber)) {
            newErrors.alternateMobileNumber = 'Must be 10 digits'
        }
        if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle Type is required'
        if (!formData.insuranceType) newErrors.insuranceType = 'Insurance Type is required'
        if (!formData.policyStartDate) newErrors.policyStartDate = 'Start Date is required'
        if (!formData.policyExpiryDate) newErrors.policyExpiryDate = 'Expiry Date is required'

        if (formData.policyStartDate && formData.policyExpiryDate) {
            if (new Date(formData.policyStartDate) >= new Date(formData.policyExpiryDate)) {
                newErrors.policyStartDate = 'Start Date must be before Expiry Date'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError('')
        if (!validate()) return

        try {
            await updateInsurance({ id, ...formData }).unwrap()
            showToast({ message: 'Insurance Updated Successfully!', type: 'success' })
            navigate('/insurances')
        } catch (err) {
            console.error('Failed to update insurance:', err)
            const errorMessage = err.data?.message || err.message || 'Failed to update insurance'
            setServerError(errorMessage)
            showToast({ message: errorMessage, type: 'error' })
        }
    }

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-blue-900" />
            </div>
        )
    }

    if (isError || !insurance) {
        return (
            <div className="text-center text-red-500 py-8">
                Error loading insurance record
            </div>
        )
    }

    return (
        <div>
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-600 hover:text-gray-900">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Insurance</h1>
                </div>

                {serverError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Registration Number"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            error={errors.registrationNumber}
                            required
                            placeholder="KA01AB1234"
                            style={{ textTransform: 'uppercase' }}
                        />

                        <Input
                            label="Customer Name"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            error={errors.customerName}
                            required
                            placeholder="John Doe"
                        />

                        <Input
                            label="Mobile Number"
                            name="mobileNumber"
                            type="number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            error={errors.mobileNumber}
                            required
                            placeholder="9876543210"
                        />

                        <Input
                            label="Alternate Mobile"
                            name="alternateMobileNumber"
                            type="number"
                            value={formData.alternateMobileNumber}
                            onChange={handleChange}
                            error={errors.alternateMobileNumber}
                            placeholder="Optional"
                        />

                        <Select
                            label="Vehicle Type"
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            error={errors.vehicleType}
                            required
                            options={['Two Wheeler', 'Four Wheeler', 'Goods Vehicle', 'Passenger Vehicle']}
                        />

                        <Select
                            label="Insurance Type"
                            name="insuranceType"
                            value={formData.insuranceType}
                            onChange={handleChange}
                            error={errors.insuranceType}
                            required
                            options={['Third Party', 'Package (Full Cover)', 'Standalone OD']}
                        />

                        <Select
                            label="Insurance Duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            error={errors.duration}
                            required
                            options={['1 Year', '2 Years', '3 Years', '4 Years', 'Custom']}
                        />

                        <Input
                            label="Policy Start Date"
                            name="policyStartDate"
                            type="date"
                            value={formData.policyStartDate}
                            onChange={handleChange}
                            error={errors.policyStartDate}
                            required
                        />

                        <Input
                            label="Policy Expiry Date"
                            name="policyExpiryDate"
                            type="date"
                            value={formData.policyExpiryDate}
                            onChange={handleChange}
                            error={errors.policyExpiryDate}
                            required
                            readOnly={formData.duration !== 'Custom'}
                            style={{
                                backgroundColor: formData.duration !== 'Custom' ? '#f3f4f6' : 'white',
                                cursor: formData.duration !== 'Custom' ? 'not-allowed' : 'text'
                            }}
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Any additional notes..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 bg-white font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400 font-medium transition-colors"
                        >
                            {isLoading ? 'Updating...' : 'Update Insurance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditInsurance
