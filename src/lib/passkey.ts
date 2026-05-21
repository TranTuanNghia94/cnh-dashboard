import type { IErrorResponse } from '@/types/api'

const WEBAUTHN_NOT_SUPPORTED_MESSAGE =
  'Trình duyệt hoặc thiết bị của bạn không hỗ trợ passkey. Vui lòng dùng Chrome, Safari hoặc Edge trên HTTPS (hoặc localhost).'

export const isWebAuthnSupported = () => {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof window.PublicKeyCredential !== 'undefined'
  )
}

export const getWebAuthnUnsupportedMessage = () => WEBAUTHN_NOT_SUPPORTED_MESSAGE

export const getDefaultPasskeyDeviceName = () => {
  if (typeof navigator === 'undefined') {
    return 'Thiết bị không xác định'
  }

  const platform = navigator.platform?.trim()
  const userAgent = navigator.userAgent

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return platform ? `${platform} (Safari)` : 'iPhone'
  }

  if (/Android/i.test(userAgent)) {
    return 'Android'
  }

  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return 'Mac'
  }

  if (/Windows/i.test(userAgent)) {
    return 'Windows'
  }

  if (/Linux/i.test(userAgent)) {
    return 'Linux'
  }

  return platform || 'Thiết bị'
}

export const getPasskeyErrorMessage = (error: unknown) => {
  if (!error) {
    return 'Không thể xử lý passkey, vui lòng thử lại.'
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as IErrorResponse
    if (apiError.errorMessage) {
      return apiError.errorMessage
    }
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Bạn đã hủy xác thực passkey hoặc thao tác đã hết hạn.'
    }

    if (error.name === 'InvalidStateError') {
      return 'Passkey này đã được đăng ký trên thiết bị.'
    }

    if (error.name === 'SecurityError') {
      return 'Passkey không khả dụng trên domain hiện tại. Vui lòng kiểm tra cấu hình WEBAUTHN_ORIGINS/WEBAUTHN_RP_ID.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Không thể xử lý passkey, vui lòng thử lại.'
}
