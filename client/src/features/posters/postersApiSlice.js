import { apiSlice } from '../../features/api/apiSlice';

export const postersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getActivePosters: builder.query({
            query: () => '/posters/active',
            providesTags: ['Poster'],
        }),
        getAllPosters: builder.query({
            query: () => '/posters',
            providesTags: ['Poster'],
        }),
        uploadPoster: builder.mutation({
            query: (formData) => ({
                url: '/posters',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Poster'],
        }),
        togglePosterStatus: builder.mutation({
            query: (id) => ({
                url: `/posters/${id}/toggle`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Poster'],
        }),
        deletePoster: builder.mutation({
            query: (id) => ({
                url: `/posters/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Poster'],
        }),
    }),
});

export const {
    useGetActivePostersQuery,
    useGetAllPostersQuery,
    useUploadPosterMutation,
    useTogglePosterStatusMutation,
    useDeletePosterMutation,
} = postersApiSlice;
