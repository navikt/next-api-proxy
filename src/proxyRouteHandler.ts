import { copyHeaders, resolveForwardedValues } from './proxyUtils'

type RouteHandlerProxyTarget = {
    hostname: string
    path: string
    https: boolean
    bearerToken?: string
    port?: string
    includeCookies?: boolean
    forwardedHost?: boolean
    forwardedPrefix?: string
}

export async function proxyRouteHandler(
    request: Request,
    { hostname, https, path, bearerToken, port, includeCookies, forwardedHost, forwardedPrefix }: RouteHandlerProxyTarget,
): Promise<Response> {
    const requestUrl = new URL(request.url)
    requestUrl.host = hostname
    requestUrl.port =  port ?? ''
    requestUrl.protocol = https ? 'https:' : 'http:'
    requestUrl.pathname = path

    const headers = copyHeaders(request.headers, includeCookies)
    if (bearerToken) {
        headers.set('Authorization', `Bearer ${bearerToken}`)
    }
    if (forwardedHost) {
        const { host, proto } = resolveForwardedValues(request.headers)
        if (!headers.has('x-forwarded-host'))  headers.set('x-forwarded-host', host)
        if (!headers.has('x-forwarded-proto')) headers.set('x-forwarded-proto', proto)
    }
    if (forwardedPrefix !== undefined && !headers.has('x-forwarded-prefix')) {
        headers.set('x-forwarded-prefix', forwardedPrefix)
    }

    return fetch(requestUrl, {
        headers,
        method: request.method,
        body: request.body,
        duplex: 'half',
    })
}
