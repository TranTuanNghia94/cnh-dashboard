/** Normalize API / Axios errors into short Vietnamese toast copy. */
export function getApiErrorMessage(error: unknown, fallback = 'Không thể hoàn tất thao tác. Vui lòng thử lại.'): string {
  if (!error) return fallback

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  if (error instanceof Error) {
    const axiosData = (error as Error & {
      response?: { data?: { message?: string; error?: string } }
    }).response?.data

    const fromBody = axiosData?.message || axiosData?.error
    if (fromBody && typeof fromBody === 'string' && fromBody.trim()) {
      return fromBody.trim()
    }

    // Drop noisy Axios status dumps as primary copy
    if (/^Request failed with status code \d+$/i.test(error.message)) {
      return fallback
    }
    if (error.message?.trim()) {
      return error.message.trim()
    }
  }

  return fallback
}
