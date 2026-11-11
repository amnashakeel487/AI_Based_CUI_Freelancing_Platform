/**
 * Notifications service.
 */
import { get, post } from './api'

/** List notifications (optionally unread only). */
export async function getNotifications(unreadOnly = false) {
  const qs = unreadOnly ? '?unread=true' : ''
  return get(`/notifications/${qs}`)
}

/** Mark a single notification as read. */
export async function markNotificationRead(id) {
  return post(`/notifications/${id}/read`, {})
}

/** Mark all notifications as read. */
export async function markAllNotificationsRead() {
  return post('/notifications/read-all', {})
}
