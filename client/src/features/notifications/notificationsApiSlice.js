import { apiSlice } from '../api/apiSlice';

export const notificationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        subscribeToNotifications: builder.mutation({
            query: (token) => ({
                url: '/notifications/subscribe',
                method: 'POST',
                body: { token },
            }),
        }),
        unsubscribeFromNotifications: builder.mutation({
            query: (token) => ({
                url: '/notifications/unsubscribe',
                method: 'POST',
                body: { token },
            }),
        }),
    }),
});

export const {
    useSubscribeToNotificationsMutation,
    useUnsubscribeFromNotificationsMutation,
} = notificationsApiSlice;
