import { apiSlice } from '../api/apiSlice'

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: (params) => ({
                url: '/users',
                params: params,
            }),
            keepUnusedDataFor: 5,
            providesTags: (result) =>
                result?.users
                    ? [
                        ...result.users.map(({ _id }) => ({ type: 'User', id: _id })),
                        { type: 'User', id: 'LIST' },
                    ]
                    : [{ type: 'User', id: 'LIST' }],
        }),
        registerUser: builder.mutation({
            query: (userData) => ({
                url: '/users',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        toggleBlockStatus: builder.mutation({
            query: (id) => ({
                url: `/users/${id}/block`,
                method: 'PUT',
            }),
            invalidatesTags: ['User'],
        }),
        resetPassword: builder.mutation({
            query: ({ id, password }) => ({
                url: `/users/${id}/reset-password`,
                method: 'PUT',
                body: { password },
            }),
        }),
        updateUserProfile: builder.mutation({
            query: (data) => ({
                url: '/users/profile',
                method: 'PUT',
                body: data,
            }),
        }),
    }),
})

export const {
    useGetUsersQuery,
    useRegisterUserMutation,
    useToggleBlockStatusMutation,
    useResetPasswordMutation,
    useUpdateUserProfileMutation,
} = usersApiSlice
