/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { Query, Provider } from '../src/index';

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
            <Query query="{ posts { id title } }" v-slot="{ data }">
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
  expect(fetch).toHaveBeenCalledTimes(1);

  await flushPromises();
  // cache was used.
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelectorAll('li').length).toBe(5);
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
            <Query query="{ posts { id title } }" v-slot="{ data, execute }">
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
  expect(fetch).toHaveBeenCalledTimes(1);

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // cache was used.
  expect(fetch).toHaveBeenCalledTimes(1);
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
            <Query query="{ posts { id title } }" v-slot="{ data, execute }">
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
  expect(fetch).toHaveBeenCalledTimes(1);

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
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
            <Query query="{ posts { id title } }" v-slot="{ data, execute }" cache-policy="cache-and-network">
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
  expect(fetch).toHaveBeenCalledTimes(1);

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
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
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="{ id }" v-slot="{ data }">
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
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelector('h1')?.textContent).toContain('12');
  (vm as any).id = 13;
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(document.querySelector('h1')?.textContent).toContain('13');
});

test('variables watcher can be disabled', async () => {
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
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="{ id }" :watch-variables="true" v-slot="{ data }">
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
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelector('h1')?.textContent).toContain('12');
  (vm as any).id = 13;
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelector('h1')?.textContent).toContain('12');
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
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="vars" v-slot="{ data }">
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
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelector('h1')?.textContent).toContain('12');
  (vm as any).vars = {
    type: 'test',
    id: 12,
  };
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  (vm as any).vars.id = 13;
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(document.querySelector('h1')?.textContent).toContain('13');
});

// have no clue how to test this yet
// eslint-disable-next-line jest/no-disabled-tests
test.skip('can be suspended', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  (global as any).fetchController.delay = 100;
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
              <Query query="{ posts { id title } }" v-slot="{ data }" suspend>
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

  expect(document.body.textContent).toBe('Loading...');
  await flushPromises();
  expect(document.querySelectorAll('li').length).toBe(5);
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
            <Query query="{ posts { id title propNotFound } }" v-slot="{ data, error }">
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
  expect(document.querySelector('#error')?.textContent).toMatch(/Cannot query field/);
});

test('Handles external errors', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  (global as any).fetchController.simulateNetworkError = true;

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
            <Query query="{ posts { id title propNotFound } }" v-slot="{ data, error }">
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
  expect(document.querySelector('#error')?.textContent).toMatch(/Network Error/);
});

test('Handles empty slots', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  (global as any).fetchController.simulateNetworkError = true;

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
            <Query query="{ posts { id title propNotFound } }" v-slot="{ data, error }"></Query>
          </div>
        </Provider>
      `,
  });

  await flushPromises();
  expect(document.querySelector('#body')?.textContent).toBe('');
});
