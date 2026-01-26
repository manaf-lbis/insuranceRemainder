import { apiSlice } from '../../features/api/apiSlice';

export const newsCategoriesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNewsCategories: builder.query({
            query: () => '/news-categories',
            providesTags: ['NewsCategory'],
        }),
        createNewsCategory: builder.mutation({
            query: (data) => ({
                url: '/news-categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['NewsCategory'],
        }),
        deleteNewsCategory: builder.mutation({
            query: (id) => ({
                url: `/news-categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['NewsCategory'],
        }),
    }),
});

export const {
    useGetNewsCategoriesQuery,
    useCreateNewsCategoryMutation,
    useDeleteNewsCategoryMutation,
} = newsCategoriesApiSlice;
