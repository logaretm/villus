/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import { Query, Provider } from '../src/index';
import { PostQuery, PostsQuery, QueryWithGqlError, QueryWithNetworkError } from './mocks/queries';
import flushPromises from 'flush-promises';
import waitForExpect from 'wait-for-expect';

test('executes queries on mounted', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostsQuery}" v-slot="{ data }">
              <div v-if="data">
                <ul>
                  <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
                </ul>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  await flushPromises();
  await waitForExpect(() => {
    // cache was used.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('li').length).toBe(5);
  });
});

test('caches queries by default', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostsQuery}" v-slot="{ data, execute }">
              <div v-if="data">
                <ul>
                  <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
                </ul>
                <button @click="execute()"></button>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
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
  });
});

test('cache policy can be overridden with execute function', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostsQuery}" v-slot="{ data, execute }">
              <div v-if="data">
                <ul>
                  <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
                </ul>
                <button @click="execute({ cachePolicy: 'cache-and-network' })"></button>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
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

test('cache policy can be overridden with cachePolicy prop', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostsQuery}" v-slot="{ data, execute }" cache-policy="cache-and-network">
              <div v-if="data">
                <ul>
                  <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
                </ul>
                <button @click="execute()"></button>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
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

test('variables are watched by default', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  const vm = mount({
    data: () => ({
      client,
      id: 12,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostQuery}" :variables="{ id }" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
  });

  (vm as any).id = 13;
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('13');
  });
});

test('variables watcher can be disabled and enabled', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  const vm = mount({
    data: () => ({
      client,
      id: 12,
      enabled: false,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostQuery}" :variables="{ id }" :watch-variables="enabled" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>

          <button @click="enabled = !enabled"></button>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
  });

  (vm as any).id = 13;
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
  });

  document.querySelector('button')?.click();
  await flushPromises();
  (vm as any).id = 14;
  await flushPromises();

  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('14');
  });
});

test('variables prop arrangement does not trigger queries', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  const vm = mount({
    data: () => ({
      client,
      vars: {
        id: 12,
        type: 'test',
      },
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Query query="${PostQuery}" :variables="vars" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('h1')?.textContent).toContain('12');
  });

  (vm as any).vars = {
    type: 'test',
    id: 12,
  };
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  (vm as any).vars.id = 13;
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector('h1')?.textContent).toContain('13');
  });
});

test('can be suspended', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <Suspense>
            <template #default>
              <Query query="${PostsQuery}" v-slot="{ data }" suspended>
                <ul>
                  <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
                </ul>
              </Query>
            </template>
            <template #fallback>
              <span>Loading...</span>
            </template>
          </Suspense>
        </Provider>
      </div>
    `,
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
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
        <Provider v-bind="client">
          <div>
            <Query query="${QueryWithGqlError}" v-slot="{ data, error }">
              <ul v-if="data">
                <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
              </ul>
              <p id="error" v-if="error">{{ error.message }}</p>
            </Query>
          </div>
        </Provider>
      `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toMatch(/Not authenticated/);
  });
});

test('Handles external errors', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
        <Provider v-bind="client">
          <div>
            <Query query="${QueryWithNetworkError}" v-slot="{ data, error }">
              <ul v-if="data">
                <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
              </ul>
              <p id="error" v-if="error">{{ error.message }}</p>
            </Query>
          </div>
        </Provider>
      `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toMatch(/Failed to connect/);
  });
});

test('Handles empty slots', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Query,
      Provider,
    },
    template: `
        <Provider v-bind="client">
          <div id="body">
            <Query query="${QueryWithNetworkError}" v-slot="{ data, error }"></Query>
          </div>
        </Provider>
      `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#body')?.textContent).toBe('');
  });
});
