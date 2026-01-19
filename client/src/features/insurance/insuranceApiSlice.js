import { apiSlice } from '../../features/api/apiSlice';

export const insuranceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInsurances: builder.query({
            query: (params) => ({
                url: '/insurances',
                params: params,
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
    }),
});

export const {
    useGetInsurancesQuery,
    useAddInsuranceMutation,
    useGetDashboardStatsQuery,
    useSendReminderMutation,
    useDeleteInsuranceMutation,
} = insuranceApiSlice;
