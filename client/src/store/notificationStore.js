/**
 * src/store/notificationStore.js
 *
 * In-app notification inbox.
 *
 * Distinct from react-hot-toast (which shows transient feedback toasts).
 * This store tracks durable notifications — dataset approved/rejected,
 * new comment on your dataset, org invitation, etc. — that persist until
 * the user dismisses them, survive page refreshes, and power a notification
 * bell in the Navbar.
 *
 * Persisted to localStorage under the key `odk_notifications` so the
 * unread count survives a refresh without a network round-trip.
 *
 * Pattern: same shape as authStore, uiStore, and searchStore (Zustand).
 */

import { create } from 'zustand'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'odk_notifications'
const MAX_STORED  = 50   // Never keep more than this many in localStorage

/** All valid notification types — mirrors the kinds of events the platform emits */
export const NOTIFICATION_TYPES = {
    DATASET_APPROVED:  'dataset_approved',
    DATASET_REJECTED:  'dataset_rejected',
    DATASET_COMMENTED: 'dataset_commented',
    DATASET_REVIEWED:  'dataset_reviewed',
    ORG_INVITE:        'org_invite',
    ORG_MEMBER_ADDED:  'org_member_added',
    API_KEY_EXPIRING:  'api_key_expiring',
    SYSTEM:            'system',
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveToStorage(notifications) {
    try {
        // Keep only the most recent MAX_STORED entries to cap storage size
        const trimmed = notifications.slice(0, MAX_STORED)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
        // Storage full or unavailable — fail silently
    }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationStore = create((set, get) => ({
    /** Array of notification objects, newest first */
    notifications: loadFromStorage(),

                                                          // ── Derived ──────────────────────────────────────────────────────────────

                                                          /** Number of unread notifications */
                                                          get unreadCount() {
                                                              return get().notifications.filter((n) => !n.read).length
                                                          },

                                                          /** true when there are any unread notifications */
                                                          get hasUnread() {
                                                              return get().notifications.some((n) => !n.read)
                                                          },

                                                          // ── Actions ───────────────────────────────────────────────────────────────

                                                          /**
                                                           * Add a new notification.
                                                           *
                                                           * @param {{
                                                           *   type:     string,   One of NOTIFICATION_TYPES
                                                           *   title:    string,   Short heading  e.g. "Dataset approved"
                                                           *   message:  string,   Body text
                                                           *   link?:    string,   Optional internal route e.g. '/datasets/my-dataset'
                                                           *   meta?:    Object,   Any extra data (datasetSlug, orgSlug, etc.)
                                                           * }} notification
                                                           */
                                                          add: (notification) => {
                                                              const next = {
                                                                  id:        `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                                          type:      notification.type ?? NOTIFICATION_TYPES.SYSTEM,
                                                          title:     notification.title ?? '',
                                                          message:   notification.message ?? '',
                                                          link:      notification.link ?? null,
                                                          meta:      notification.meta ?? {},
                                                          read:      false,
                                                          createdAt: new Date().toISOString(),
                                                              }

                                                              set((state) => {
                                                                  const updated = [next, ...state.notifications]
                                                                  saveToStorage(updated)
                                                                  return { notifications: updated }
                                                              })
                                                          },

                                                          /**
                                                           * Mark a single notification as read.
                                                           * @param {string} id
                                                           */
                                                          markRead: (id) => {
                                                              set((state) => {
                                                                  const updated = state.notifications.map((n) =>
                                                                  n.id === id ? { ...n, read: true } : n,
                                                                  )
                                                                  saveToStorage(updated)
                                                                  return { notifications: updated }
                                                              })
                                                          },

                                                          /** Mark all notifications as read. */
                                                          markAllRead: () => {
                                                              set((state) => {
                                                                  const updated = state.notifications.map((n) => ({ ...n, read: true }))
                                                                  saveToStorage(updated)
                                                                  return { notifications: updated }
                                                              })
                                                          },

                                                          /**
                                                           * Remove a single notification by id.
                                                           * @param {string} id
                                                           */
                                                          remove: (id) => {
                                                              set((state) => {
                                                                  const updated = state.notifications.filter((n) => n.id !== id)
                                                                  saveToStorage(updated)
                                                                  return { notifications: updated }
                                                              })
                                                          },

                                                          /** Remove all notifications. */
                                                          clear: () => {
                                                              saveToStorage([])
                                                              set({ notifications: [] })
                                                          },

                                                          /**
                                                           * Remove all notifications that are already read.
                                                           * Keeps unread ones so nothing important is lost.
                                                           */
                                                          clearRead: () => {
                                                              set((state) => {
                                                                  const updated = state.notifications.filter((n) => !n.read)
                                                                  saveToStorage(updated)
                                                                  return { notifications: updated }
                                                              })
                                                          },
                                                           }))

// ─── Convenience factory helpers ──────────────────────────────────────────────
// Use these instead of constructing raw objects so callers stay in sync
// with the type constants and never need to import NOTIFICATION_TYPES.

const { add } = useNotificationStore.getState()

export const notify = {
    datasetApproved: (title, datasetSlug) =>
    add({
        type:    NOTIFICATION_TYPES.DATASET_APPROVED,
        title:   'Dataset Approved',
        message: `"${title}" has been approved and is now publicly visible.`,
        link:    `/datasets/${datasetSlug}`,
        meta:    { datasetSlug },
    }),

    datasetRejected: (title, datasetSlug, reason) =>
    add({
        type:    NOTIFICATION_TYPES.DATASET_REJECTED,
        title:   'Dataset Rejected',
        message: reason
        ? `"${title}" was rejected: ${reason}`
        : `"${title}" was rejected. Please review the moderation note.`,
        link:    `/datasets/${datasetSlug}`,
        meta:    { datasetSlug },
    }),

    newComment: (datasetTitle, datasetSlug) =>
    add({
        type:    NOTIFICATION_TYPES.DATASET_COMMENTED,
        title:   'New Comment',
        message: `Someone commented on "${datasetTitle}".`,
        link:    `/datasets/${datasetSlug}`,
        meta:    { datasetSlug },
    }),

    newReview: (datasetTitle, datasetSlug) =>
    add({
        type:    NOTIFICATION_TYPES.DATASET_REVIEWED,
        title:   'New Review',
        message: `"${datasetTitle}" received a new rating.`,
        link:    `/datasets/${datasetSlug}`,
        meta:    { datasetSlug },
    }),

    orgInvite: (orgName, orgSlug) =>
    add({
        type:    NOTIFICATION_TYPES.ORG_INVITE,
        title:   'Organization Invitation',
        message: `You have been invited to join ${orgName}.`,
        link:    `/organizations/${orgSlug}`,
        meta:    { orgSlug },
    }),

    apiKeyExpiring: (keyName) =>
    add({
        type:    NOTIFICATION_TYPES.API_KEY_EXPIRING,
        title:   'API Key Expiring Soon',
        message: `Your API key "${keyName}" will expire in less than 7 days.`,
        link:    '/account/api-keys',
        meta:    { keyName },
    }),

    system: (title, message, link) =>
    add({
        type:    NOTIFICATION_TYPES.SYSTEM,
        title,
        message,
        link:    link ?? null,
    }),
}
