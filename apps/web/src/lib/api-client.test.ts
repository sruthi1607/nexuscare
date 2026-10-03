import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { jsonResponse, mockFetch } from '../test/utils';
import { ApiError, apiRequest } from './api-client';

const schema = z.object({ value: z.number() });

describe('apiRequest', () => {
  it('returns validated data from a success envelope', async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { value: 42 } }));

    await expect(apiRequest('/api/thing', schema)).resolves.toEqual({ value: 42 });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/thing');
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('serialises JSON bodies', async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { value: 1 } }, 201));
    await apiRequest('/api/thing', schema, { method: 'POST', body: { a: 1 } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"a":1}');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('merges caller headers of any HeadersInit shape', async () => {
    const fetchMock = mockFetch(
      jsonResponse({ data: { value: 1 } }),
      jsonResponse({ data: { value: 2 } }),
    );
    await apiRequest('/api/thing', schema, { headers: new Headers({ 'X-Trace': 'a' }) });
    await apiRequest('/api/thing', schema, { headers: [['X-Trace', 'b']] });

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('X-Trace')).toBe('a');
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-Trace')).toBe('b');
  });

  it('maps error envelopes to ApiError with code and request id', async () => {
    mockFetch(
      jsonResponse({ error: { code: 'NOT_FOUND', message: 'Nope', requestId: 'req-1' } }, 404),
    );

    const error = await apiRequest('/api/thing', schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Nope',
      requestId: 'req-1',
    });
  });

  it('reports network failures as NETWORK_ERROR', async () => {
    mockFetch(new TypeError('Failed to fetch'));
    await expect(apiRequest('/api/thing', schema)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });

  it('rejects responses that do not match the schema', async () => {
    mockFetch(jsonResponse({ data: { value: 'not a number' } }));
    await expect(apiRequest('/api/thing', schema)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('falls back to HTTP_ERROR for non-envelope error bodies', async () => {
    mockFetch(new Response('Bad gateway', { status: 502 }));
    await expect(apiRequest('/api/thing', schema)).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      status: 502,
    });
  });

  it('accepts success envelopes on explicitly allowed non-2xx statuses', async () => {
    mockFetch(jsonResponse({ data: { value: 7 } }, 503));
    await expect(apiRequest('/api/thing', schema, { successStatuses: [503] })).resolves.toEqual({
      value: 7,
    });
  });
});
