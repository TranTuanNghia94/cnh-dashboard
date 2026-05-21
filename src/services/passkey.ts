import { fetcher, fetcherWithAuth, METHODS } from '@/lib/api'
import {
  URL_PASSKEY_BY_ID,
  URL_PASSKEYS,
  URL_PASSKEYS_LOGIN_OPTIONS,
  URL_PASSKEYS_LOGIN_VERIFY,
  URL_PASSKEYS_REGISTER_OPTIONS,
  URL_PASSKEYS_REGISTER_VERIFY,
} from '@/lib/url'
import type {
  IPasskeyAuthResponse,
  IPasskeyCredential,
  IPasskeyLoginOptionsRequest,
  IPasskeyLoginOptionsResponse,
  IPasskeyLoginVerifyRequest,
  IPasskeyRegisterOptionsResponse,
  IPasskeyRegisterVerifyRequest,
} from '@/types/passkey'

export const getPasskeyLoginOptions = async (body: IPasskeyLoginOptionsRequest = {}) => {
  const response = await fetcher<IPasskeyLoginOptionsResponse>(URL_PASSKEYS_LOGIN_OPTIONS, {
    method: METHODS.POST,
    data: body,
  })

  return response
}

export const verifyPasskeyLogin = async (body: IPasskeyLoginVerifyRequest) => {
  const response = await fetcher<IPasskeyAuthResponse>(URL_PASSKEYS_LOGIN_VERIFY, {
    method: METHODS.POST,
    data: body,
  })

  return response
}

export const getPasskeyRegisterOptions = async () => {
  const response = await fetcherWithAuth<IPasskeyRegisterOptionsResponse>(
    URL_PASSKEYS_REGISTER_OPTIONS,
    {
      method: METHODS.POST,
    }
  )

  return response
}

export const verifyPasskeyRegister = async (body: IPasskeyRegisterVerifyRequest) => {
  const response = await fetcherWithAuth<string>(URL_PASSKEYS_REGISTER_VERIFY, {
    method: METHODS.POST,
    data: body,
  })

  return response
}

export const getPasskeys = async () => {
  const response = await fetcherWithAuth<IPasskeyCredential[]>(URL_PASSKEYS, {
    method: METHODS.GET,
  })

  return response
}

export const deletePasskey = async (credentialId: string) => {
  const response = await fetcherWithAuth<string>(
    URL_PASSKEY_BY_ID.replace('{credentialId}', encodeURIComponent(credentialId)),
    {
      method: METHODS.DELETE,
    }
  )

  return response
}
