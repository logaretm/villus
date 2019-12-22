import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { withProvider, Query, createClient, Provider } from '../src/index';
import App from './App.vue';

const Vue = createLocalVue();
Vue.component('Query', Query);

test('executes queries on mounted', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const AppWithGQL = withProvider(App, client);

  const wrapper = mount(AppWithGQL, { sync: false, localVue: Vue });
  await flushPromises();
  expect(wrapper.findAll('li').length).toBe(5);
});

test('caches queries by default', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
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
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // cache was used.
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('cache policy can be overridden with execute function', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
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
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('cache policy can be overridden with cachePolicy prop', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
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
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('variables are watched by default', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client,
        id: 12
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
          <div>
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="{ id }" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
  wrapper.setData({
    id: 13
  });
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(wrapper.find('h1').text()).toContain('13');
});

test('variables watcher can be disabled', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client,
        id: 12
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
          <div>
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="{ id }" :pause="true" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
  wrapper.setData({
    id: 13
  });
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
});

test('variables prop arrangement does not trigger queries', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client,
        vars: {
          id: 12,
          type: 'test'
        }
      }),
      components: {
        Query,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
          <div>
            <Query query="query fetchPost($id: ID!) { post (id: $id) { id title } }" :variables="vars" v-slot="{ data }">
              <div v-if="data">
                <h1>{{ data.post.title }}</h1>
              </div>
            </Query>
          </div>
        </Provider>
      </div>
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
  (wrapper.vm as any).vars = {
    type: 'test',
    id: 12
  };
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  (wrapper.vm as any).vars.id = 13;
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(wrapper.find('h1').text()).toContain('13');
});

test('Handles query errors', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Query,
        Provider
      },
      template: `
        <Provider :client="client">
          <div>
            <Query query="{ posts { id title propNotFound } }" v-slot="{ data, errors }">
              <ul v-if="data">
                <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
              </ul>
              <p id="error" v-if="errors">{{ errors[0].message }}</p>
            </Query>
          </div>
        </Provider>
      `
    },
    { sync: false }
  );

  await flushPromises();
  expect(wrapper.find('#error').text()).toMatch(/Cannot query field/);
});

test('Handles external errors', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  (global as any).fetchController.simulateNetworkError = true;

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Query,
        Provider
      },
      template: `
        <Provider :client="client">
          <div>
            <Query query="{ posts { id title propNotFound } }" v-slot="{ data, errors }">
              <ul v-if="data">
                <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
              </ul>
              <p id="error" v-if="errors">{{ errors[0].message }}</p>
            </Query>
          </div>
        </Provider>
      `
    },
    { sync: false }
  );

  await flushPromises();
  expect(wrapper.find('#error').text()).toMatch(/Network Error/);
});
