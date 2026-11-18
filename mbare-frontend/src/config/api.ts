
/**
 * MBARE - API Configuration
 * Frontend React + Vite + TypeScript
 *
 * Development: http://localhost:3001
 * Production:  https://api.mbare.site
 */

// ==========================================
// CONFIGURAZIONE
// ==========================================

const DEFAULT_API_URL = import.meta.env.PROD
  ? 'https://api.mbare.site'
  : 'http://localhost:3001';

export const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, '');

// ==========================================
// TIPI
// ==========================================

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export interface ApiRequestOptions
  extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
}

// ==========================================
// GESTIONE ERRORI
// ==========================================

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

// ==========================================
// FUNZIONE API GENERICA
// ==========================================

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    token,
    body,
    headers,
    ...fetchOptions
  } = options;

  if (!endpoint.startsWith('/')) {
    throw new Error(
      'L’endpoint API deve iniziare con "/".'
    );
  }

  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders.set(
      'Content-Type',
      'application/json'
    );
  }

  if (token) {
    requestHeaders.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body)
    }
  );

  // Le risposte possono essere JSON o testo
  const contentType =
    response.headers.get('content-type') || '';

  let data: unknown = null;

  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  }

  if (!response.ok) {
    const errorData =
      typeof data === 'object' && data !== null
        ? data as Record<string, unknown>
        : null;

    const message =
      typeof errorData?.message === 'string'
        ? errorData.message
        : typeof errorData?.error === 'string'
          ? errorData.error
          : `Errore HTTP ${response.status}`;

    throw new ApiRequestError(
      message,
      response.status,
      data
    );
  }

  return data as T;
}

// ==========================================
// METODI HTTP
// ==========================================

export const api = {
  get: <T>(
    endpoint: string,
    token?: string | null
  ) =>
    apiRequest<T>(endpoint, {
      method: 'GET',
      token
    }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    token?: string | null
  ) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body,
      token
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    token?: string | null
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body,
      token
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    token?: string | null
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body,
      token
    }),

  delete: <T>(
    endpoint: string,
    token?: string | null
  ) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
      token
    })
};
