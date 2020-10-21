/* eslint-disable no-unused-expressions */
import { ref, computed, reactive } from 'vue';
import gql from 'graphql-tag';
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { useClient, useQuery } from '../src/index';
import { Post } from './server/typedSchema';

describe('useQuery()', () => {
  test('executes hook queries on mounted', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery<{ posts: Post[] }>('{ posts { id title } }');

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

    expect(document.querySelectorAll('li').length).toBe(5);
  });

  test('alternate signature', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery<{ posts: Post[] }>('{ posts { id title } }');

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

    expect(document.querySelectorAll('li').length).toBe(5);
  });

  test('works with tagged queries', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data } = useQuery({
          query: gql`
            {
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
    expect(document.querySelectorAll('li').length).toBe(5);
  });

  test('caches queries by default', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: '{ posts { id title } }' });

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
    expect(fetch).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    // cache was used.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('re-runs reactive queries automatically', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const id = ref(12);
        const query = computed(() => {
          return `{ post (id: ${id.value}) { id title } }`;
        });

        const { data } = useQuery({
          query,
        });

        return { data, id };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="id = 13"></button>
    </div>`,
    });

    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('13');
  });

  test('cache policy can be overridden with execute function', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: '{ posts { id title } }' });

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
    expect(fetch).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    // fetch was triggered a second time.
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('cache policy can be overridden with cachePolicy option', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: '{ posts { id title } }', cachePolicy: 'cache-and-network' });

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
    expect(fetch).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    // fetch was triggered a second time.
    expect(fetch).toHaveBeenCalledTimes(2);
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
          query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
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
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('13');
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

        const { data } = useQuery('query fetchPost($id: ID!) { post (id: $id) { id title } }', variables);

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
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('13');
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
          query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
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
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('button')?.dispatchEvent(new Event('click'));

    await flushPromises();
    // fetch was triggered a second time, due to variable change.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
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
          query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
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
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    document.querySelector('#toggle')?.dispatchEvent(new Event('click'));
    document.querySelector('#change')?.dispatchEvent(new Event('click'));

    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
    expect(document.querySelector('#status')?.textContent).toContain('false');

    // toggle it back
    document.querySelector('#toggle')?.dispatchEvent(new Event('click'));
    document.querySelector('#change')?.dispatchEvent(new Event('click'));
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('14');
    expect(document.querySelector('#status')?.textContent).toContain('true');
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
          query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
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
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
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
            const { data } = await useQuery({ query: '{ posts { id title } }' });

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

    expect(document.body.textContent).toBe('Loading...');
    await flushPromises();
    expect(document.querySelectorAll('li').length).toBe(5);
  });

  test('Handles query errors', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title propNotFound } }',
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
    expect(document.querySelector('#error')?.textContent).toMatch(/Cannot query field/);
  });

  test('Handles parse errors', async () => {
    (global as any).fetchController.simulateParseError = true;

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title } }',
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
    expect(document.querySelector('#error')?.textContent).toMatch(/Error parsing/);
  });

  test('Handles network errors', async () => {
    (global as any).fetchController.simulateNetworkError = true;

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title } }',
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
    expect(document.querySelector('#error')?.textContent).toMatch(/Network Error/);
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

  test('Errors are stringified nicely to their messages', async () => {
    (global as any).fetchController.simulateNetworkError = true;

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title } }',
        });

        return { data, error };
      },
      template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.toString() }}</p>
    </div>`,
    });

    await flushPromises();
    expect(document.querySelector('#error')?.textContent).toMatch(/Network Error/);
  });

  test('Errors can be separated by type', async () => {
    (global as any).fetchController.simulateNetworkError = true;

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title } }',
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
    expect(document.querySelector('#error')?.textContent).toBe('Network');
  });

  // # 49
  test('Errors can have non 200 response code', async () => {
    (global as any).fetchController.simulateNetworkErrorWithGraphQLResponse = true;

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, error } = useQuery({
          query: '{ posts { id title } }',
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
    expect(document.querySelector('#error')?.textContent).toBe('GraphQL');
  });

  test('cache-only policy returns null results if not found', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          cachePolicy: 'cache-only',
        });

        const { data, execute } = useQuery({ query: '{ posts { id title } }' });

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
    expect(fetch).toHaveBeenCalledTimes(0);
    expect(document.querySelector('ul')).toBeNull();
  });

  test('cache-only policy returns results if found in cache', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        const { data, execute } = useQuery({ query: '{ posts { id title } }' });

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
    expect(fetch).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.dispatchEvent(new Event('click'));
    await flushPromises();
    // cache was used.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('ul')?.children).toHaveLength(5);
  });

  test('dedups duplicate queries', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
        });

        useQuery({ query: '{ posts { id title } }' });
        useQuery({ query: '{ posts { id title } }' });
        useQuery({ query: '{ posts { id title } }' });
        useQuery({ query: '{ posts { id title slug } }' });
        useQuery({ query: '{ posts { id title slug } }' });

        return {};
      },
      template: `<div></div>`,
    });

    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2); // only 2 unique queries were executed
  });
});
