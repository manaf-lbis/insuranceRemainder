import { apiSlice } from '../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (code) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...code },
            }),
        }),
    }),
});

export const { useLoginMutation } = authApiSlice;
