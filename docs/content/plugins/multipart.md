---
title: File Uploads
description: Using the multipart plugin for file uploads
order: 4
---

# Query Batching

Villus has support for file uploads but it is not configured out of the box, So you would need to manually import it and configure it with `villus` client.

The multipart plugin is available as its own package under the name `@villus/multipart`

## Basic File Upload

First add the plugin to your dependencies using `yarn` or `npm`:

```bash
yarn add @villus/multipart
# Or
npm install @villus/multipart
```

Then import the `multipart` plugin from `villus` and make sure it is before the `fetch` plugin:

```js
import { useClient, fetch } from 'villus';
import { multipart } from '@villus/multipart';

export default {
  setup() {
    useClient({
      url: 'https://test.com/graphql',
      use: [multipart(), fetch()],
    });
  },
};
```

And that's it, Now you can use files in your queries/mutations:

```vue
<template>
  <div>
    <input type="file" name="upload" id="" @change="upload" />
  </div>
</template>

<script>
import { useClient, useMutation, fetch } from 'villus';
import { multipart } from '@villus/multipart';

export default {
  setup() {
    useClient({
      url: 'http://localhost:9000/graphql',
      use: [multipart(), fetch()],
    });

    const SingleUpload = `
      mutation SingleUpload ($file: Upload!) {
        singleUpload(file: $file) {
          id
          path
          mimetype
          filename
        }
      }
      `;

    const { execute } = useMutation(SingleUpload);

    async function upload(e) {
      await execute({
        file: e.target.files[0],
      }).then(({ data, error }) => {
        console.log(data, error);
      });
    }

    return {
      upload,
    };
  },
};
</script>
```

<doc-tip type="danger">
  Note that the `multipart` plugin currently is not supported by the `batch` plugin, you can only use it with `fetch` and your custom fetchers if applicable.
</doc-tip>

## Options

At this moment the multipart plugin doesn't have any options to customize

## Code

You can check the [source code for the `fetch` plugin](https://github.com/logaretm/villus/blob/master/packages/villus/src/fetch.ts) and use it as a reference to build your own
