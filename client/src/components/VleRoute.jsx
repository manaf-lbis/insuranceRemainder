import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const VleRoute = () => {
    const { user } = useSelector((state) => state.auth)
    const isVle = user && ['vle', 'akshaya'].includes(user.role)
    return isVle ? <Outlet /> : <Navigate to="/login" replace />
}

export default VleRoute
