---
title: Mutations
description: Learn how to run GraphQL mutations
order: 4
---

# Mutations

## Mutations Basics

**villus** offers both a `useMutation` function and a `Mutation` component that are very similar their **[querying](./queries.md)** counterparts but with few distinct differences:

- They **do not** accept a `variables` prop or argument.
- They **do not** run automatically, you have to explicitly call `execute`.
- Cache policies do not apply to mutations as mutations represent user actions and will always use `network-only` policy.

Here is an example for the `useMutation` function:

```vue
<template>
  <div>
    <div v-if="data">
      <p>{{ data.likePost.message }}</p>
    </div>
    <button @click="execute()">Submit</button>
  </div>
</template>

<script>
import { useMutation } from 'villus';

export default {
  setup() {
    const LikePost = `
      mutation {
        likePost (id: 123) {
          message
        }
      }
    `;
    const { data, execute } = useMutation(LikePost);

    return {
      data,
      execute,
    };
  },
};
</script>
```

## Passing Variables

Since the `useMutation` function does not accept a `variables` property you can pass them to the `execute` function:

```js
const LikePost = `
  mutation LikePost ($id: ID!) {
    likePost (id: $id) {
      message
    }
  }
`;

// in setup
const { data, execute } = useMutation(LikePost);
const variables = {
  id: 123,
};

function onSubmit() {
  execute(variables);
}
```

## Handling Errors

You can handle errors by either grabbing the `error` ref returned from the `useMutation` function or by checking the result of the `execute` promise, the latter is preferable as it makes more sense in most situations. The `execute` function doesn't throw and collects all encountered errors into a `CombinedError` instance that contains any GraphQL or network errors encountered.

```js
const LikePost = `
  mutation LikePost ($id: ID!) {
    likePost (id: $id) {
      message
    }
  }
`;

// in setup
const { data, execute } = useMutation(LikePost);
const variables = {
  id: 123,
};

function onSubmit() {
  execute(variables).then(result => {
    if (result.error) {
      // Do something
    }
  });
}
```

There are more stuff you can do with mutations, like displaying progress for users. Check the API documentation for [useMutation](../api/use-mutation) and [Mutation component](../api/mutation).
