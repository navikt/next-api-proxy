import { Readable } from 'stream'
import http, { type RequestOptions } from 'http'
import https from 'https'

import type { NextApiRequest, NextApiResponse } from 'next'

import { copyHeaders, stream2buffer } from './proxyUtils'

interface ProxyApiRouteRequestOptions {
    hostname: string
    path: string
    req: NextApiRequest
    res: NextApiResponse
    bearerToken?: string
    port?: number;
    /** default: true */
    https?: boolean
    includeCookies?: boolean
}

export async function proxyApiRouteRequest({
    hostname,
    path,
    req,
    res,
    bearerToken,
    port,
    includeCookies,
    https: useHttps = true,
}: ProxyApiRouteRequestOptions): Promise<void> {
    const headers = {
        ...copyHeaders(req.headers, includeCookies),
    }
    if (bearerToken) {
        headers.Authorization = `Bearer ${bearerToken}`
    }

    const requestOptions: RequestOptions = {
        hostname,
        port: port ?? (useHttps ? 443 : 80),
        path,
        method: req.method,
        headers,
    }

    const stream = Readable.from(req)
    const bodyResponse = await stream2buffer(stream)
    const backendReq = (useHttps ? https : http).request(requestOptions, (proxyRequestResponse) => {
        if (proxyRequestResponse.statusCode != null) {
            res.status(proxyRequestResponse.statusCode)
        }
        for (const headersKey in proxyRequestResponse.headers) {
            const header = proxyRequestResponse.headers[headersKey]
            if (header) {
                res.setHeader(headersKey, header)
            }
        }

        proxyRequestResponse.on('data', (data: unknown) => {
            res.write(data)
        })
        proxyRequestResponse.on('end', () => {
            res.end()
        })
    })

    backendReq.on('error', (error) => {
        console.warn('Error in proxy request:', error)
        res.status(500).json({ message: 'Error occurred while proxying the request.' })
    })

    backendReq.write(bodyResponse)
    backendReq.end()
}
