import type { IAuth } from './auth'

export interface IPasskeyLoginOptionsRequest {
  identifier?: string
}

export interface IPasskeyLoginOptionsResponse {
  sessionId: string
  optionsJson: string
}

export interface IPasskeyLoginVerifyRequest {
  sessionId: string
  credentialJson: string
}

export interface IPasskeyRegisterOptionsResponse {
  optionsJson: string
}

export interface IPasskeyRegisterVerifyRequest {
  credentialJson: string
  deviceName: string
}

export interface IPasskeyCredential {
  credentialId?: string
  id?: string
  credentialID?: string
  credential_id?: string
  passkeyId?: string
  deviceName?: string
  device_name?: string
  name?: string
  createdAt?: string
  created_at?: string
  lastUsedAt?: string
  last_used_at?: string
}

export type IPasskeyAuthResponse = IAuth
