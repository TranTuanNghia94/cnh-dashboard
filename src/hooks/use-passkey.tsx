import { QUERIES } from '@/lib/constants'
import { getDefaultPasskeyDeviceName, getPasskeyErrorMessage } from '@/lib/passkey'
import { setAuthenAndAuthor } from '@/hooks/use-auth'
import {
  deletePasskey,
  getPasskeyLoginOptions,
  getPasskeyRegisterOptions,
  getPasskeys,
  verifyPasskeyLogin,
  verifyPasskeyRegister,
} from '@/services/passkey'
import type { IErrorResponse } from '@/types/api'
import type { IPasskeyCredential } from '@/types/passkey'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import * as webauthnJson from '@github/webauthn-json'
import { toast } from './use-toast'

const showPasskeyError = (error: unknown, title: string) => {
  toast({
    variant: 'destructive',
    title,
    description: getPasskeyErrorMessage(error),
  })
}

export const getPasskeyCredentialId = (passkey: IPasskeyCredential) => {
  return (
    passkey.credentialId ||
    passkey.id ||
    passkey.credentialID ||
    passkey.credential_id ||
    passkey.passkeyId ||
    ''
  )
}

const normalizePasskey = (passkey: IPasskeyCredential): IPasskeyCredential => ({
  ...passkey,
  credentialId: getPasskeyCredentialId(passkey),
  deviceName: passkey.deviceName || passkey.device_name || passkey.name || 'Thiết bị không tên',
  createdAt: passkey.createdAt || passkey.created_at,
  lastUsedAt: passkey.lastUsedAt || passkey.last_used_at,
})

export const usePasskeysQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERIES.PASSKEYS],
    queryFn: async () => {
      const response = await getPasskeys()
      return (response?.data ?? []).map(normalizePasskey)
    },
    enabled,
  })
}

export const usePasskeyLoginMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationKey: [QUERIES.PASSKEY_LOGIN],
    mutationFn: async (identifier?: string) => {
      const optionsResponse = await getPasskeyLoginOptions(
        identifier?.trim() ? { identifier: identifier.trim() } : {}
      )
      const { sessionId, optionsJson } = optionsResponse.data
      const requestOptions = JSON.parse(optionsJson)
      const assertion = await webauthnJson.get(requestOptions)

      return verifyPasskeyLogin({
        sessionId,
        credentialJson: JSON.stringify(assertion),
      })
    },
    onError(error: IErrorResponse | unknown) {
      showPasskeyError(error, 'Lỗi đăng nhập passkey')
    },
    onSuccess(response) {
      if (response?.data) {
        setAuthenAndAuthor(response.data)
        navigate({ to: '/home', replace: true })
      }
    },
  })
}

export const usePasskeyRegisterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [QUERIES.PASSKEY_REGISTER],
    mutationFn: async (deviceName?: string) => {
      const optionsResponse = await getPasskeyRegisterOptions()
      const creationOptions = JSON.parse(optionsResponse.data.optionsJson)
      const credential = await webauthnJson.create(creationOptions)

      return verifyPasskeyRegister({
        credentialJson: JSON.stringify(credential),
        deviceName: deviceName?.trim() || getDefaultPasskeyDeviceName(),
      })
    },
    onError(error: IErrorResponse | unknown) {
      showPasskeyError(error, 'Lỗi đăng ký passkey')
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERIES.PASSKEYS] })
      toast({
        title: 'Đăng ký passkey thành công',
        variant: 'success',
        description: 'Bạn có thể đăng nhập nhanh bằng passkey ở lần sau.',
        duration: 3000,
      })
    },
  })
}

export const useDeletePasskeyMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [QUERIES.PASSKEY_DELETE],
    mutationFn: async (credentialId: string) => {
      if (!credentialId) {
        throw new Error('Không tìm thấy credentialId của passkey.')
      }

      return deletePasskey(credentialId)
    },
    onError(error: IErrorResponse | unknown) {
      showPasskeyError(error, 'Lỗi xóa passkey')
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERIES.PASSKEYS] })
      toast({
        title: 'Đã xóa passkey',
        variant: 'success',
        duration: 3000,
        description: 'Passkey đã được gỡ khỏi tài khoản của bạn.',
      })
    },
  })
}

export const useDeleteAllPasskeysMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [QUERIES.PASSKEY_DELETE, 'all'],
    mutationFn: async (credentialIds: string[]) => {
      const validCredentialIds = credentialIds.filter(Boolean)

      if (validCredentialIds.length === 0) {
        throw new Error('Không tìm thấy passkey hợp lệ để xóa.')
      }

      return Promise.all(validCredentialIds.map(deletePasskey))
    },
    onError(error: IErrorResponse | unknown) {
      showPasskeyError(error, 'Lỗi tắt đăng nhập bằng passkey')
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERIES.PASSKEYS] })
      toast({
        title: 'Đã tắt đăng nhập bằng passkey',
        description: 'Tất cả passkey đã được gỡ khỏi tài khoản của bạn.',
        variant: 'success',
        duration: 3000,
      })
    },
  })
}
