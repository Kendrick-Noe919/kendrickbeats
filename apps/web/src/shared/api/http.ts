import type { ApiErrorDto } from '@kendrick/contracts'
import { API_URL } from '../config'

/** Erreur renvoyée par l'API (ou impossibilité de la joindre). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiError'
  }
}

function isApiErrorDto(value: unknown): value is ApiErrorDto {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const { error } = value
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  if (isApiErrorDto(body)) {
    return new ApiError(response.status, body.error.code, body.error.message)
  }
  return new ApiError(response.status, 'UNKNOWN_ERROR', 'Une erreur inattendue est survenue')
}

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  body?: unknown
  /** Jeton d'accès, envoyé dans l'en-tête Authorization. */
  token?: string
}

async function request<TResponse>({
  method,
  path,
  body,
  token,
}: RequestOptions): Promise<TResponse> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token !== undefined) headers['Authorization'] = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    throw new ApiError(0, 'NETWORK_ERROR', 'Impossible de joindre le serveur', { cause: error })
  }

  if (!response.ok) {
    throw await toApiError(response)
  }
  return (await response.json()) as TResponse
}

export function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return request<TResponse>({ method: 'POST', path, body })
}

export function getJson<TResponse>(path: string, token?: string): Promise<TResponse> {
  return request<TResponse>({ method: 'GET', path, token })
}
