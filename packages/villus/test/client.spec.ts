import { createApp } from 'vue';
import { test, expect, vi } from 'vitest';
import flushPromises from 'flush-promises';
import { defaultPlugins } from '../src/client';
import { createClient, useQuery } from '../src/index';
import { ClientPlugin } from '../src/types';
import { PostsQuery } from './mocks/queries';
import waitForExpect from 'wait-for-expect';

test('fails if a fetcher was not provided', () => {
  (global as any).fetch = undefined;
  expect(() => {
    // @ts-expect-error Checking for run-time error
    createClient({ fetch: null });
  }).toThrow(/Could not resolve/);
});

test('fails if executes an non-provided query', async () => {
  try {
    const client = createClient({
      url: '',
    });

    await client.executeQuery({ query: null as any });
  } catch (err) {
    expect((err as Error).message).toMatch(/A query must be provide/);
  }
});

test('supports async plugins', async () => {
  const auth: ClientPlugin = async ({ opContext }) => {
    (opContext.headers as any).Authorization = 'Bearer {TOKEN}';
  };

  const client = createClient({
    url: 'https://test.com/graphql',
    use: [auth, ...defaultPlugins()],
  });

  const { data } = await client.executeQuery({ query: PostsQuery });

  expect(data).toBeDefined();
});

test('throws if no plugins set the result for the operation', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    use: [],
  });

  await expect(client.executeQuery({ query: PostsQuery })).rejects.toThrow(
    'Operation result was not set by any plugin, make sure you have default plugins configured or review documentation'
  );
});

test('plugins can use the response', async () => {
  const spy = vi.fn();
  const plugin: ClientPlugin = async ({ afterQuery }) => {
    afterQuery((_, { response }) => {
      spy(response?.headers.get('content-type'));
    });
  };

  const client = createClient({
    url: 'https://test.com/graphql',
    use: [plugin, ...defaultPlugins()],
  });

  await client.executeQuery({ query: PostsQuery });
  expect(spy).toHaveBeenCalledWith('application/json');
});

test('works as a Vue plugin', async () => {
  const app = createApp({
    setup() {
      const { data, error } = useQuery({ query: PostsQuery });

      return { data, error };
    },
    template: `<div>'
      <div>{{ error }}</div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
  });

  app.use(
    createClient({
      url: 'https://test.com/graphql',
    })
  );

  document.body.innerHTML = `<div id="app"></div>`;
  app.mount('#app');
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelectorAll('li').length).toBe(5);
  });
});
