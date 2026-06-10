import type { IncomingHttpHeaders } from 'http'
import { Stream } from 'stream'

export function resolveForwardedValues(headers: Headers): { host: string; proto: string }
export function resolveForwardedValues(headers: IncomingHttpHeaders): { host: string; proto: string }
export function resolveForwardedValues(headers: Headers | IncomingHttpHeaders): { host: string; proto: string } {
    if (headers instanceof Headers) {
        return {
            host: headers.get('x-forwarded-host') ?? headers.get('host') ?? '',
            proto: headers.get('x-forwarded-proto') ?? 'https',
        }
    }

    const rawHost = headers['x-forwarded-host'] ?? headers['host'] ?? ''
    const rawProto = headers['x-forwarded-proto'] ?? 'https'
    return {
        host: Array.isArray(rawHost) ? rawHost[0] : rawHost,
        proto: Array.isArray(rawProto) ? rawProto[0] : rawProto,
    }
}

export async function stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const buffer = Array<Uint8Array>()
        stream.on('data', (chunk) => buffer.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(buffer)))
        stream.on('error', (err) => reject(`error converting stream - ${err}`))
    })
}

const headersToSkip = ['host', 'authorization']

export function copyHeaders(reqHeaders: Headers, includeCookies: boolean | undefined): Headers
export function copyHeaders(reqHeaders: IncomingHttpHeaders, includeCookies: boolean | undefined): IncomingHttpHeaders
export function copyHeaders(
    reqHeaders: IncomingHttpHeaders | Headers,
    includeCookies: boolean | undefined,
): IncomingHttpHeaders | Headers {
    if (reqHeaders instanceof Headers) {
        const headers: Headers = new Headers()
        for (const [key, value] of reqHeaders.entries()) {
            if (key.toLowerCase() === 'cookie' && includeCookies) {
                headers.set(key, value)
            } else if (!headersToSkip.includes(key.toLowerCase())) {
                headers.set(key, value)
            }
        }
        return headers
    }

    const headers: IncomingHttpHeaders = {}
    for (const headersKey in reqHeaders) {
        if (!headersToSkip.includes(headersKey.toLowerCase())) {
            headers[headersKey] = reqHeaders[headersKey]
        }
    }
    return headers
}
