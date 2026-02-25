import { apiSlice } from '../api/apiSlice'

export const issuesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getIssues: builder.query({
            query: (params) => ({
                url: '/issues',
                params
            }),
            providesTags: ['Issue'],
        }),
        createIssue: builder.mutation({
            query: (data) => ({
                url: '/issues',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Issue'],
        }),
        updateIssueStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/issues/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Issue'],
        }),
        addIssueComment: builder.mutation({
            query: ({ id, text }) => ({
                url: `/issues/${id}/comments`,
                method: 'POST',
                body: { text },
            }),
            invalidatesTags: ['Issue'],
        }),
    }),
})

export const {
    useGetIssuesQuery,
    useCreateIssueMutation,
    useUpdateIssueStatusMutation,
    useAddIssueCommentMutation,
} = issuesApiSlice
