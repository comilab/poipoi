import Notification from '~/models/Notification'
import useApi from '~/composables/use-api'

export default function useNotificationsApi () {
  const api = useApi('/notifications', Notification)

  return {
    ...api,
    notifications: api.items
  }
}
