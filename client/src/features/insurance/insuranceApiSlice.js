import { apiSlice } from '../../features/api/apiSlice';

export const insuranceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInsurances: builder.query({
            query: ({ status, search, page, limit, expiryFrom, expiryTo }) => ({
                url: '/insurances',
                params: { status, search, page, limit, expiryFrom, expiryTo },
            }),
            providesTags: ['Insurance'],
            keepUnusedDataFor: 5,
        }),
        getDashboardStats: builder.query({
            query: () => '/dashboard/stats',
            keepUnusedDataFor: 5,
        }),
        sendReminder: builder.mutation({
            query: (insuranceId) => ({
                url: `/reminders/${insuranceId}/send`,
                method: 'POST',
            }),
        }),
        addInsurance: builder.mutation({
            query: (initialInsuranceData) => ({
                url: '/insurances',
                method: 'POST',
                body: {
                    ...initialInsuranceData,
                },
            }),
            invalidatesTags: ['Insurance'],
        }),
        deleteInsurance: builder.mutation({
            query: (id) => ({
                url: `/insurances/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Insurance'],
        }),
        getInsuranceById: builder.query({
            query: (id) => `/insurances/${id}`,
            providesTags: (result, error, id) => [{ type: 'Insurance', id }],
        }),
        updateInsurance: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/insurances/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Insurance'],
        }),
    }),
});

export const {
    useGetInsurancesQuery,
    useAddInsuranceMutation,
    useGetDashboardStatsQuery,
    useSendReminderMutation,
    useDeleteInsuranceMutation,
    useGetInsuranceByIdQuery,
    useUpdateInsuranceMutation,
} = insuranceApiSlice;
