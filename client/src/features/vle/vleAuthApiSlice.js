import { apiSlice } from '../api/apiSlice'
import { setCredentials, logOut } from '../auth/authSlice'

export const vleAuthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        vleSignup: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/signup',
                method: 'POST',
                body: data,
            }),
        }),
        vleVerifyOtp: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/verify-otp',
                method: 'POST',
                body: data,
            }),
        }),
        vleResendOtp: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/resend-otp',
                method: 'POST',
                body: data,
            }),
        }),
        vleLogin: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/login',
                method: 'POST',
                body: data,
            }),
        }),
        vleForgotPassword: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        vleResetPassword: builder.mutation({
            query: (data) => ({
                url: '/vle-auth/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
        // Documents
        uploadDocument: builder.mutation({
            query: (formData) => ({
                url: '/documents/upload',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Document'],
        }),
        getDocuments: builder.query({
            query: (params) => ({
                url: '/documents',
                params
            }),
            providesTags: ['Document'],
        }),
        deleteDocument: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Document'],
        }),
        updateDocumentStatus: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/documents/${id}/status`,
                method: 'PUT',
                body: rest,
            }),
            invalidatesTags: ['Document'],
        }),
        checkSimilarity: builder.mutation({
            query: (data) => ({
                url: '/documents/check-similarity',
                method: 'POST',
                body: data,
            }),
        }),
        incrementDownload: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}/download`,
                method: 'POST',
            }),
            invalidatesTags: ['Document'],
        }),
        getDocStats: builder.query({
            query: () => '/documents/stats',
            providesTags: ['Document'],
        }),
        getTopContributors: builder.query({
            query: () => '/documents/top-contributors',
            providesTags: ['Document'],
        }),
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
})

export const {
    useVleSignupMutation,
    useVleVerifyOtpMutation,
    useVleResendOtpMutation,
    useVleLoginMutation,
    useVleForgotPasswordMutation,
    useVleResetPasswordMutation,
    useUploadDocumentMutation,
    useGetDocumentsQuery,
    useDeleteDocumentMutation,
    useUpdateDocumentStatusMutation,
    useIncrementDownloadMutation,
    useGetDocStatsQuery,
    useGetTopContributorsQuery,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useCheckSimilarityMutation,
} = vleAuthApiSlice
