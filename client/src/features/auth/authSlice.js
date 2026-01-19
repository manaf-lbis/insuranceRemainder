import { createSlice } from '@reduxjs/toolkit'

// Get user from localStorage if exists
const userInfoFromStorage = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null

const initialState = {
    user: userInfoFromStorage,
    token: userInfoFromStorage?.token,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token, ...otherInfo } = action.payload
            state.user = { ...action.payload } // Store full object payload as user
            state.token = action.payload.token // Explicitly set token
            localStorage.setItem('userInfo', JSON.stringify(action.payload))
        },
        logOut: (state) => {
            state.user = null
            state.token = null
            localStorage.removeItem('userInfo')
        },
    },
})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer
