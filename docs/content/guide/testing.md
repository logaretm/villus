---
title: Writing Tests
description: Recommendations and examples for writing tests
order: 8
---

# Writing Tests

villus does not have any special treatment when it comes to writing unit and integration tests, but this topic can be confusing. In this guide, you will find some recommendations and examples on how to write unit tests for components using `villus`.

## Testing tools and methodology

It is recommended that you use either [Vue Test Utils (VTU)](https://next.vue-test-utils.vuejs.org/) or [testing library](https://testing-library.com/docs/vue-testing-library/intro/) to write your tests. The following examples in this guide will use VTU.

We will follow an example where we implement a posts list component unit test.

Here is the component code in question:

```vue
<template>
  <ul v-if="data>
    <li v-for="post in data.posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import { defineComponent } from 'vue';
import { useQuery } from 'villus';

export default defineComponent({
  name: 'PostsList',
  setup() {
    const { data } = useQuery({
      query: `
        query Posts {
          posts {
            id
            title
          }
        }
      `,
    });

    return {
      data,
    };
  },
});
</script>
```

## Setting up Global Injections

All the queries and mutations you use in your application components rely on the `provide/inject` API. Typically you would have an `App.vue` component setup where you would [setup your villus client](/guide/setup). In unit tests, you don't usually mount the entire app hierarchy as you are only interested in testing a specific component, hence why it's called "unit test".

That means you need to provide the client setup injection to your component, this can be done using [VTU global mounting options](https://next.vue-test-utils.vuejs.org/api/#global).

```js
import { createClient, VILLUS_CLIENT } from 'villus';
import { mount } from '@vue/test-utils';
import PostsList from '@/components/PostsList.vue';

test('it lists the blog posts', async () => {
  const wrapper = mount(PostsList, {
    global: {
      [VILLUS_CLIENT]: createClient({
        url: 'http://test/graphql',
      }),
    },
  });

  // TODO: Write assertions
});
```

Note that since `villus` uses ES6 symbols to identify the villus client object. This is why the `VILLUS_CLIENT` is exported to you, so you can freely inject the villus client manually when needed.

It might be worthwhile to refactor the above snippet to some test helper since you will be doing that a lot in your tests.

## Mocking Network Requests

The next step would be to mock the response the component expects from the API. This can be done in two different ways:

- Mock the `fetch` function and have it return the response
- Use an advanced mocking library like [mswjs](https://mswjs.io/) to mock an API server

While the former can be simpler, It is recommended to go with the mswjs approach since it allows you to test GraphQL error responses and it allows you to test your component in an environment that's much closer to real-world.

This guide won't focus on how to do either of these methods, but it is recommended to go with mswjs.

## Writing Assertions

Assuming you've set up your network request mocked environment, the next step would be writing the actual assertion to make sure the component does its job.

Here is some assertions that test if the component fetches the data when mounted and displays the posts returned from the API:

```js
import { createClient, VILLUS_CLIENT } from 'villus';
import { mount } from '@vue/test-utils';
import waitForExpect from 'wait-for-expect';
import PostsList from '@/components/PostsList.vue';

test('it lists the blog posts', async () => {
  const wrapper = mount(PostsList, {
    global: {
      [VILLUS_CLIENT]: createClient({
        url: 'http://test/graphql',
      }),
    },
  });

  await waitForExpect(() => {
    expect(wrapper.findAll('li').length).toBeGreaterThan(0);
  });
});
```

Notice the use of [wait-for-expect](https://www.npmjs.com/package/wait-for-expect) module to allow us to retry the assertions until they are met or until they fail after a max number of retries. This is very useful because the time needed to wait for the components to mount and fetch from your mocked API is unknown.
