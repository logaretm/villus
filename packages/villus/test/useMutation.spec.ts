/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import { useClient, useMutation, useQuery } from '../src/index';
import { computed, defineComponent, ref } from 'vue';
import {
  LikePostMutation,
  MutationWithNetworkError,
  MutationWithParseError,
  MutationWithGqlError,
  PostsQuery,
} from './mocks/queries';
import flushPromises from 'flush-promises';
import waitForExpect from 'wait-for-expect';

test('runs mutations', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation<{ likePost: { id: number; title: string } }>(LikePostMutation);

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.title }}</p>
      </div>
      <button @click="execute()"></button>
    </div>`,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('p')?.textContent).toContain('Awesome Post');
  });
});

test('passes variables via execute method', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation(LikePostMutation);

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <button @click="execute({ id: 123 })"></button>
    </div>`,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('p')?.textContent).toBe('123');
  });
});

test('handles parse errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithParseError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toMatch(/invalid json response body/);
  });
});

test('handles mutation errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithGqlError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toContain('Not authenticated');
  });
});

test('handles network errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithNetworkError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toContain('Failed to connect');
  });
});

test('Fails if provider was not resolved', async () => {
  try {
    mount({
      setup() {
        const { data, execute } = useMutation(LikePostMutation);

        return { data, execute };
      },
      template: `
        <div>
          <div v-if="data">
            <p>{{ data.likePost.message }}</p>
          </div>
          <button @click="execute()"></button>
        </div>`,
    });
  } catch (err) {
    await waitForExpect(() => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect((err as Error).message).toContain('Cannot detect villus Client');
    });
  }
});

test('runs mutations with custom headers per mutation', async () => {
  const ctx = {
    'SOME-AUTH-HEADER': 'OH YEA',
  };
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation(LikePostMutation, {
        context: computed(() => {
          return {
            headers: ctx,
          };
        }),
      });

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <button @click="execute()"></button>
    </div>`,
  });

  await flushPromises();
  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();

  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledWith(
      'https://test.com/graphql',
      expect.objectContaining({
        url: 'https://test.com/graphql',
        body: expect.anything(),
        method: 'POST',
        headers: expect.objectContaining(ctx),
      })
    );
  });
});

test('clears cache of previous queries which has the same tag', async () => {
  let refetch!: () => void;
  let mutate!: () => void;
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const query = useQuery({ query: PostsQuery, tags: ['test'] });
      const mutation = useMutation(LikePostMutation, {
        clearCacheTags: ['test'],
      });

      refetch = query.execute;
      mutate = mutation.execute;

      return { data: query.data };
    },
    template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
  });
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  await refetch();
  await flushPromises();
  // cache was used.
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  await mutate();
  await flushPromises();
  // mutation was executed
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // cache was evicted.
  await refetch();
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

test('refetch tagged queries that has the same tag', async () => {
  let mutate!: () => void;
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const query = useQuery({ query: PostsQuery, tags: ['test'] });
      const mutation = useMutation(LikePostMutation, {
        refetchTags: ['test'],
      });

      mutate = mutation.execute;

      return { data: query.data };
    },
    template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
  });
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  await mutate();
  await flushPromises();
  // mutation was executed and also the query
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

test('unmounted queries do not refetch', async () => {
  let mutate!: () => void;
  const show = ref(true);
  const Query = defineComponent({
    setup() {
      const query = useQuery({ query: PostsQuery, tags: ['test'] });

      return { data: query.data };
    },
    template: '<div></div>',
  });
  mount({
    components: {
      Query,
    },
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const mutation = useMutation(LikePostMutation, {
        refetchTags: ['test'],
      });

      mutate = mutation.execute;

      return { show };
    },
    template: `<Query v-if="show"></Query>`,
  });
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  show.value = false;
  await flushPromises();
  await mutate();
  await flushPromises();
  // mutation was executed but not the query
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
