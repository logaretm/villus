import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { withProvider, Query, createClient, Provider } from '../src/index';
import App from './App.vue';

const Vue = createLocalVue();
Vue.component('Query', Query);

test('executes queries on mounted', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
  });

  const AppWithGQL = withProvider(App, client);

  const wrapper = mount(AppWithGQL, { sync: false, localVue: Vue });
  await flushPromises();
  expect(wrapper.findAll('li').length).toBe(5);
});

test('caches queries by default', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
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
  expect(fetch).toBeCalledTimes(1);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // cache was used.
  expect(fetch).toBeCalledTimes(1);
});

test('cache policy can be overridden', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
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
  expect(fetch).toBeCalledTimes(1);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toBeCalledTimes(2);
});

test('variables are watched by default', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
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
  expect(fetch).toBeCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
  wrapper.setData({
    id: 13
  });
  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toBeCalledTimes(2);
  expect(wrapper.find('h1').text()).toContain('13');
});

test('variable watcher can be disabled', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
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
  expect(fetch).toBeCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
  wrapper.setData({
    id: 13
  });
  await flushPromises();
  expect(fetch).toBeCalledTimes(1);
  expect(wrapper.find('h1').text()).toContain('12');
});
