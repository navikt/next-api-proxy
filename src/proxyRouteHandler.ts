import { copyHeaders } from './proxyUtils'

type RouteHandlerProxyTarget = {
    hostname: string
    path: string
    https: boolean
    bearerToken?: string
}

export async function proxyRouteHandler(
    request: Request,
    { hostname, https, path, bearerToken }: RouteHandlerProxyTarget,
): Promise<Response> {
    const requestUrl = new URL(request.url)
    requestUrl.host = hostname
    requestUrl.port =  ''
    requestUrl.protocol = https ? 'https:' : 'http:'
    requestUrl.pathname = path

    const headers = copyHeaders(request.headers)
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
