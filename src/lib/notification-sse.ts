import { BASE_URL } from '@/lib/api'
import { getCookie, REFRESH_TOKEN, TOKEN } from '@/lib/cookie'
import {
  URL_NOTIFICATIONS_SUBSCRIBE,
} from '@/lib/url'
import type { INotification, INotificationInitPayload } from '@/types/notification'

export type NotificationSseHandlers = {
  onInit?: (data: INotificationInitPayload) => void
  onNotification?: (notification: INotification) => void
  onError?: (error: unknown) => void
}

function joinBaseAndPath(base: string, path: string) {
  const b = base.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return `${b}/${p}`
}

/**
 * Browser EventSource cannot set Authorization headers. This uses fetch + SSE
 * parsing so Bearer tokens match the rest of the app.
 */
export async function consumeNotificationSse(
  handlers: NotificationSseHandlers & { signal?: AbortSignal },
): Promise<void> {
  const token = getCookie(TOKEN)
  if (!token) {
    handlers.onError?.(new Error('Missing auth token'))
    return
  }

  const refreshToken = getCookie(REFRESH_TOKEN)
  const url = joinBaseAndPath(BASE_URL, URL_NOTIFICATIONS_SUBSCRIBE)

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
      ...(refreshToken ? { 'Refresh-Token': refreshToken } : {}),
    },
    signal: handlers.signal,
  })

  if (!res.ok || !res.body) {
    const err = new Error(`SSE failed: ${res.status}`)
    handlers.onError?.(err)
    throw err
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let carry = ''

  const dispatchBlock = (block: string) => {
    const lines = block.split(/\r?\n/)
    let eventName = 'message'
    const dataParts: string[] = []
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataParts.push(line.slice(5).replace(/^\s/, ''))
      }
    }
    const raw = dataParts.join('\n')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as unknown
      if (eventName === 'init') {
        handlers.onInit?.(parsed as INotificationInitPayload)
      } else if (eventName === 'notification') {
        handlers.onNotification?.(parsed as INotification)
      }
    } catch {
      handlers.onError?.(new Error('Invalid SSE JSON'))
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      carry += decoder.decode(value, { stream: true })
      const chunks = carry.split(/\r?\n\r?\n/)
      carry = chunks.pop() ?? ''
      for (const chunk of chunks) {
        if (chunk.trim()) dispatchBlock(chunk)
      }
    }
  } finally {
    reader.releaseLock()
  }
}
