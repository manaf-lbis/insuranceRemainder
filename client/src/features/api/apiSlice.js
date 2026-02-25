import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logOut } from '../auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        // Force logout on 401
        api.dispatch(logOut())
    }
    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Insurance', 'Poster', 'Announcement', 'Document'],
    endpoints: (builder) => ({}),
})
