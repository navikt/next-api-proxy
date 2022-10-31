# next-api-proxy

A simple library that lets you use nextjs API routes to proxy requests to other applications. Useful if you need to exchange a OBO-token before executing the request.

```bash
yarn add @navikt/next-api-proxy
```

```bash
npm i @navikt/next-api-proxy
```

### Step 1: Create a simple proxy API route

Create a new API route: `/pages/api/my-new-route.ts`. Take note of the comments inside the code example.

```ts
const handler = async (req: NextApiRequest, res: NextApiResponse): void => {
    // Here you may want to exchange some tokens
    const token = exchangeToken(...);

    // Proxy the request
    await proxyApiRouteRequest({
            req,
            res,
            hostname: "my-backend.namespace",
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
