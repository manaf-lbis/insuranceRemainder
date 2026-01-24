import { apiSlice } from '../../features/api/apiSlice';

export const announcementsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPublicAnnouncements: builder.query({
            query: () => '/announcements',
            providesTags: ['Announcement'],
        }),
        getAnnouncementById: builder.query({
            query: (id) => `/announcements/${id}`,
            providesTags: (result, error, id) => [{ type: 'Announcement', id }],
        }),
        getAnnouncementByIdAdmin: builder.query({
            query: (id) => `/announcements/admin/${id}`,
            providesTags: (result, error, id) => [{ type: 'Announcement', id }],
        }),
        getAllAnnouncements: builder.query({
            query: () => '/announcements/admin',
            providesTags: ['Announcement'],
        }),
        createAnnouncement: builder.mutation({
            query: (data) => ({
                url: '/announcements/admin',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Announcement'],
        }),
        updateAnnouncement: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/announcements/admin/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Announcement', { type: 'Announcement', id }],
        }),
        deleteAnnouncement: builder.mutation({
            query: (id) => ({
                url: `/announcements/admin/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Announcement'],
        }),
        getTickerAnnouncements: builder.query({
            query: () => '/announcements/ticker',
        }),
        uploadImage: builder.mutation({
            query: (formData) => ({
                url: '/upload/image',
                method: 'POST',
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetPublicAnnouncementsQuery,
    useGetAnnouncementByIdQuery,
    useGetAnnouncementByIdAdminQuery,
    useGetAllAnnouncementsQuery,
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useDeleteAnnouncementMutation,
    useGetTickerAnnouncementsQuery,
    useUploadImageMutation,
} = announcementsApiSlice;
