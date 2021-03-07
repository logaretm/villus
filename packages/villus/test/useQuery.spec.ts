/* eslint-disable no-unused-expressions */
import { ref, computed, reactive } from 'vue';
import gql from 'graphql-tag';
import flushPromises from 'flush-promises';
import waitForExpect from 'wait-for-expect';
import { mount } from './helpers/mount';
import { useClient, useQuery } from '../src/index';
import {
  PostsQuery,
  QueryWithGqlError,
  QueryWithParseError,
  QueryWithNetworkError,
  QueryErrorWith500,
  PostQuery,
  PostsQueryWithDescription,
} from './mocks/queries';

interface Post {
  id: number;
  title: string;
}

describe('useQuery()', () => {
  test('executes hook queries on mounted', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery<{ posts: Post[] }>({
          query: PostsQuery,
        });

        return { data, error };
      },
      template: `
    <div>'
      <div>{{ error }}</div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelectorAll('li').length).toBe(5);
    });
  });

  test('accepts tagged queries', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data } = useQuery({
          query: gql`
            query Posts {
              posts {
                id
                title
              }
            }
          `,
        });

        return { data };
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
      expect(document.querySelectorAll('li').length).toBe(5);
    });
  });

  test('caches queries by default', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: PostsQuery });

        return { data, execute };
      },
      template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <button @click="execute()"></button>
    </div>`,
    });
    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    // cache was used.
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('re-runs reactive queries automatically', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const id = ref(12);
        const query = computed(() => {
          return `query Post { post (id: ${id.value}) { id title } }`;
        });

        const { data } = useQuery({
          query,
        });

        return { data, id };
      },
      template: `
    <div>
      <button @click="id = 13"></button>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    await waitForExpect(() => {
      // fetch was triggered a second time, due to variable change.
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('cache policy can be overridden with execute function', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: PostsQuery });

        return { data, execute };
      },
      template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <button @click="execute({ cachePolicy: 'cache-and-network' })"></button>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();

    await waitForExpect(() => {
      // fetch was triggered a second time.
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('cache policy can be overridden with cachePolicy option', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({
          query: PostsQuery,
          cachePolicy: 'cache-and-network',
        });

        return { data, execute };
      },
      template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <button @click="execute()"></button>
    </div>`,
    });

    await flushPromises();

    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    await waitForExpect(() => {
      // fetch was triggered a second time.
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('variables are watched by default if refs', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const variables = ref({
          id: 12,
        });

        const { data } = useQuery({
          query: PostQuery,
          variables,
        });

        return { data, variables };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="variables.id = 13"></button>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(document.querySelector('h1')?.textContent).toContain('13');
    });
  });

  test('variables are watched by default if reactive', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const variables = reactive({
          id: 12,
        });

        const { data } = useQuery({ query: PostQuery, variables });

        return { data, variables };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="variables.id = 13"></button>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    await waitForExpect(() => {
      // fetch was triggered a second time, due to variable change.
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(document.querySelector('h1')?.textContent).toContain('13');
    });
  });

  test('cached variables are matched by equality not reference', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const variables = ref({
          id: 12,
        });

        const { data } = useQuery({
          query: PostQuery,
          variables,
        });

        function updateRef() {
          variables.value = { id: 12 };
        }

        return { data, variables, updateRef };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="updateRef"></button>
    </div>`,
    });

    await flushPromises();
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    await waitForExpect(() => {
      // fetch was triggered a second time, due to variable change.
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });
  });

  test('variables watcher can be disabled', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const variables = ref({
          id: 12,
        });

        const { data, unwatchVariables, isWatchingVariables, watchVariables } = useQuery({
          query: PostQuery,
          variables,
        });

        return { data, variables, unwatchVariables, watchVariables, isWatchingVariables };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button id="change" @click="variables.id = variables.id + 1"></button>
      <button id="toggle" @click="isWatchingVariables ? unwatchVariables() : watchVariables()"></button>
      <span id="status">{{ isWatchingVariables }}</span>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });

    document.querySelector('#toggle')?.dispatchEvent(new Event('click'));
    document.querySelector('#change')?.dispatchEvent(new Event('click'));

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
      expect(document.querySelector('#status')?.textContent).toContain('false');
    });

    // toggle it back
    document.querySelector('#toggle')?.dispatchEvent(new Event('click'));
    document.querySelector('#change')?.dispatchEvent(new Event('click'));
    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(document.querySelector('h1')?.textContent).toContain('14');
      expect(document.querySelector('#status')?.textContent).toContain('true');
    });
  });

  test('variables prop arrangement does not trigger queries', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const variables = ref({
          id: 12,
          type: 'test',
        });

        const { data } = useQuery({
          query: PostQuery,
          variables,
        });

        return { data, variables };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="variables = { type: 'test', id: 12 }"></button>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('h1')?.textContent).toContain('12');
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('can be suspended', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });
      },
      components: {
        Listing: {
          async setup() {
            const { data } = await useQuery({ query: PostsQuery });

            return { data };
          },
          template: `
          <ul>
            <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
          </ul>
        `,
        },
      },
      template: `
      <div>
        <Suspense>
          <template #default>
            <Listing />
          </template>
          <template #fallback>
            <span>Loading...</span>
          </template>
        </Suspense>
      </div>`,
    });

    await waitForExpect(() => {
      expect(document.body.textContent).toBe('Loading...');
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelectorAll('li').length).toBe(5);
    });
  });

  test('Handles query errors', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: QueryWithGqlError,
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toMatch(/Not authenticated/);
    });
  });

  test('Handles parse errors', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: QueryWithParseError,
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toMatch(/invalid json response body/);
    });
  });

  test('Handles network errors', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: QueryWithNetworkError,
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toMatch(/Failed to connect/);
    });
  });

  test('Fails if provider was not resolved', () => {
    try {
      mount({
        setup() {
          const { data, error } = useQuery({ query: `{ posts { id title } }` });

          return { messages: data, error };
        },
        template: `
      <div>
        <ul v-if="data">
          <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
        </ul>
      </div>
    `,
      });
    } catch (err) {
      // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
      expect(err.message).toContain('Cannot detect villus Client');
    }
  });

  test('Errors can be separated by type', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: QueryWithNetworkError,
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.isGraphQLError ? 'GraphQL' : 'Network' }}</p>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toBe('Network');
    });
  });

  // # 49
  test('Errors can have non 200 response code', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: QueryErrorWith500,
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.isGraphQLError ? 'GraphQL' : 'Network' }}</p>
    </div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toBe('GraphQL');
    });
  });

  test('cache-only policy returns null results if not found', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          cachePolicy: 'cache-only',
        });

        const { data, execute } = useQuery({ query: PostsQuery });

        return { data, execute };
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
      expect(fetch).toHaveBeenCalledTimes(0);
      expect(document.querySelector('ul')).toBeNull();
    });
  });

  test('cache-only policy returns results if found in cache', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: PostsQuery });

        return { data, execute };
      },
      template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <button @click="execute({ cachePolicy: 'cache-only' })"></button>
    </div>`,
    });
    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    await waitForExpect(() => {
      // cache was used.
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('ul')?.children).toHaveLength(5);
    });
  });

  test('dedups duplicate queries', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        useQuery({ query: PostsQuery });
        useQuery({ query: PostsQuery });
        useQuery({ query: PostsQuery });
        useQuery({ query: PostsQueryWithDescription });
        useQuery({ query: PostsQueryWithDescription });

        return {};
      },
      template: `<div></div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // only 2 unique queries were executed
    });
  });

  test('isFetching should start with true if fetchOnMount is true', async () => {
    const spy = jest.fn();
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { isFetching } = useQuery({
          query: PostsQuery,
        });

        spy(isFetching.value);

        return {
          isFetching,
        };
      },
      template: `<div id="el">{{ isFetching }}</div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  test('isFetching should start with false if fetchOnMount is false', async () => {
    const spy = jest.fn();

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { isFetching } = useQuery({
          query: PostsQuery,
          fetchOnMount: false,
        });

        spy(isFetching.value);

        return {
          isFetching,
        };
      },
      template: `<div id="el">{{ isFetching }}</div>`,
    });

    await flushPromises();
    await waitForExpect(() => {
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  test('additional context can be provided per query', async () => {
    const ctx = {
      'SOME-AUTH-HEADER': 'OH YEA',
    };

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        useQuery({
          query: PostsQuery,
          context: {
            headers: ctx,
          },
        });

        return {};
      },
      template: `<div></div>`,
    });

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
});
