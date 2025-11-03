import { copyHeaders } from './proxyUtils'

type RouteHandlerProxyTarget = {
    hostname: string
    path: string
    https: boolean
    bearerToken?: string
    port?: string
    includeCookies?: boolean
}

export async function proxyRouteHandler(
    request: Request,
    { hostname, https, path, bearerToken, port, includeCookies }: RouteHandlerProxyTarget,
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

    return fetch(requestUrl, {
        headers,
        method: request.method,
        body: request.body,
        // @ts-expect-error Duplex property is missing in types
        duplex: 'half',
    })
}
