/**
 * Messages service — conversations and messages via API.
 * Realtime subscriptions are handled in the page component via supabase client.
 */
import { get, post } from './api'

/** List all conversations for the current user. */
export async function getConversations() {
  return get('/messages/conversations')
}

/** Get all messages in a conversation. */
export async function getMessages(conversationId) {
  return get(`/messages/conversations/${conversationId}/messages`)
}

/** Send a message in a conversation. */
export async function sendMessage(conversationId, body) {
  return post(`/messages/conversations/${conversationId}/messages`, { body })
}

/** Mark all messages from the other party as read. */
export async function markConversationRead(conversationId) {
  return post(`/messages/conversations/${conversationId}/read`, {})
}
