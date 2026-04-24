import { fetcherWithAuth, METHODS } from '@/lib/api'
import {
  URL_NOTIFICATION_MARK_READ,
  URL_NOTIFICATIONS,
} from '@/lib/url'
import type { INotificationsInbox } from '@/types/notification'
import { IRequestPaginationAndSearch } from '@/types/api'

export type INotificationListParams = IRequestPaginationAndSearch

export const getNotifications = async (params?: INotificationListParams) => {
  const response = await fetcherWithAuth<INotificationsInbox>(
    URL_NOTIFICATIONS,
    {
      method: METHODS.GET,
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    },
  )
  return response
}

export const markNotificationRead = async (id: string) => {
  const response = await fetcherWithAuth<unknown>(
    URL_NOTIFICATION_MARK_READ.replace('{id}', id),
    { method: METHODS.POST },
  )
  return response
}
