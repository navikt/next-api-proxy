# next-api-proxy

A simple library that lets you use nextjs API routes (both pages and app router) to proxy requests to other applications. Useful if you need to exchange a OBO-token before executing the request.

```bash
yarn add @navikt/next-api-proxy
```

```bash
npm i @navikt/next-api-proxy
```

### App Dir

Create a new route handler anywhere in your app-dir: `/app/my-cool-api/route.ts`.

```ts
// Remember to export the HTTP verb you want Next to expose
export async function GET(request: Request): Promise<Response> {
    // Here you may want to exchange to for example an OBO-token
    const token = exchangeToken(...);

    return proxyRouteHandler(request, {
        hostname: "my-backend.namespace",
        path: "/other-path",
        bearerToken: token,
        // use https: false if you are going through service discovery
        https: false,
    })
}
```

If you want the same function to proxy several HTTP verbs, you can do this:

```ts
export const GET = proxyMyBackend;
export const POST = proxyMyBackend;
export const PUT = proxyMyBackend;
export const DELETE = proxyMyBackend;

// Remember to export the HTTP verb you want Next to expose
async function proxyMyBackend(request: Request): Promise<Response> {
    // Here you may want to exchange to for example an OBO-token
    const token = exchangeToken(...);

    return proxyRouteHandler(request, {
        hostname: "my-backend.namespace",
        path: "/other-path",
        bearerToken: token,
        // use https: false if you are going through service discovery
        https: false,
    })
}
```

### Pages

Create a new API route: `/pages/api/my-new-route.ts`.

```ts
const handler = async (req: NextApiRequest, res: NextApiResponse): void => {
    // Here you may want to exchange to for example an OBO-token
    const token = exchangeToken(...);

    // Proxy the request
    await proxyApiRouteRequest({
            req,
            res,
            hostname: "my-backend.namespace",
            path: "/other-path",
            bearerToken: token,
            // use https: false if you are going through service discovery
            https: false,
        });
};

// It's very important to configure this, without it NextJS doesn't know we are handling the request on "our terms".
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default handler;
```

That's it! Your requests should now be proxied through NextJS.

### Migrating from v3 to v4

There are no breaking changes! Only new support for [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) in app dir.
