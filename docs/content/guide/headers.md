---
title: Headers
order: 6
---

# Headers

You often need to add authorization token to your outgoing requests like `Authorization` or localization info like `Content-Language`header.

You can pass in a `context` function to the `createClient` function. The `context` factory function should return an object that looks like this:

```ts
// The same options passed to `fetch` but without a body prop.
interface FetchOptions extends Omit<RequestInit, 'body'> {}

// The context fn result.
interface GraphQLRequestContext {
  fetchOptions?: FetchOptions;
}

type ContextFactory = () => GraphQLRequestContext;
```

This means you are able to change the headers sent with the requests, for example:

```js
import { createClient } from 'villus';

const client = createClient({
  endpoint: '/graphql',
  context: () => {
    return {
      fetchOptions: {
        headers: {
          Authorization: 'bearer TOKEN',
        },
      },
    };
  },
});
```
