import { apiErrorBodySchema, apiSuccessSchema } from '@nexuscare/shared';
import { z } from 'zod';
import { env } from './env';

const successEnvelopeSchema = apiSuccessSchema(z.unknown());

/** Client-side codes in addition to the server's error codes. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'INVALID_RESPONSE' | 'HTTP_ERROR';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /**
   * Non-2xx statuses whose body is still a success envelope (e.g. 503 from the health endpoint,
   * which reports a degraded system rather than failing).
   */
  successStatuses?: number[];
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Calls the Nexus Care API, validates the response envelope against `schema`, and returns `data`.
 * Every failure surfaces as an ApiError with a stable `code` for the UI to act on.
 */
export async function apiRequest<T extends z.ZodType>(
  path: string,
  schema: T,
  { body, successStatuses = [], headers, ...init }: ApiRequestOptions = {},
): Promise<z.infer<T>> {
  // Normalise any HeadersInit shape (object, array or Headers) before applying defaults.
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Accept')) requestHeaders.set('Accept', 'application/json');
  // Files/Blobs are sent as raw bytes with their own type (e.g. avatar uploads); anything else
  // is JSON.
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set(
      'Content-Type',
      isBlob ? (body.type || 'application/octet-stream') : 'application/json',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      // Send the httpOnly session cookie, also when the API is on a sibling origin.
      credentials: 'include',
      ...init,
      headers: requestHeaders,
      ...(body === undefined ? {} : { body: isBlob ? body : JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Unable to reach the Nexus Care server. Check your connection and try again.',
    );
  }

  const requestId = response.headers.get('x-request-id') ?? undefined;

  // 204 No Content: valid only for callers that expect no data (schema accepts undefined).
  if (response.status === 204) {
    const parsed = schema.safeParse(undefined);
    if (parsed.success) return parsed.data;
    throw new ApiError(204, 'INVALID_RESPONSE', 'The server returned no content.', requestId);
  }

  const json = await readJson(response);

  if (response.ok || successStatuses.includes(response.status)) {
    const envelope = successEnvelopeSchema.safeParse(json);
    const parsed = envelope.success ? schema.safeParse(envelope.data.data) : undefined;
    if (!parsed?.success) {
      throw new ApiError(
        response.status,
        'INVALID_RESPONSE',
        'The server returned an unexpected response.',
        requestId,
      );
    }
    return parsed.data;
  }

  const errorBody = apiErrorBodySchema.safeParse(json);
  if (errorBody.success) {
    const { code, message, details } = errorBody.data.error;
    throw new ApiError(
      response.status,
      code,
      message,
      errorBody.data.error.requestId ?? requestId,
      details,
    );
  }
  throw new ApiError(
    response.status,
    'HTTP_ERROR',
    `Request failed with status ${response.status}.`,
    requestId,
  );
}
