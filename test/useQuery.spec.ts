/* eslint-disable no-unused-expressions */
import { ref, computed } from '@vue/composition-api';
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { useClient, useQuery } from '../src/index';

test('executes hook queries on mounted', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data } = useQuery({ query: '{ posts { id title } }' });

      return { data };
    },
    template: `
    <div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`
  });

  await flushPromises();
  expect(vm.$el.querySelectorAll('li').length).toBe(5);
});

test('caches queries by default', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
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
    </div>`
  });
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // cache was used.
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('re-runs reactive queries automatically', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const id = ref(12);
      const query = computed(() => {
        return `{ post (id: ${id.value}) { id title } }`;
      });

      const { data } = useQuery({
        query
      });

      return { data, id };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="id = 13"></button>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('12');
  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));

  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('13');
});

test('cache policy can be overridden with execute function', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
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
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('cache policy can be overridden with cachePolicy option', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
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
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  // fetch was triggered a second time.
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('variables are watched by default', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const variables = ref({
        id: 12
      });

      const { data } = useQuery({
        query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
        variables
      });

      return { data, variables };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="variables.id = 13"></button>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('12');
  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));

  await flushPromises();
  // fetch was triggered a second time, due to variable change.
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('13');
});

test('variables watcher can be disabled', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const variables = ref({
        id: 12
      });

      const { data, pause, paused, resume } = useQuery({
        query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
        variables
      });

      return { data, variables, pause, resume, paused };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button id="change" @click="variables.id = variables.id + 1"></button>
      <button id="toggle" @click="paused ? resume() : pause()"></button>
      <span id="status">{{ paused }}</span>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('12');
  vm.$el.querySelector('#toggle')?.dispatchEvent(new Event('click'));
  vm.$el.querySelector('#change')?.dispatchEvent(new Event('click'));

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('12');
  expect(vm.$el.querySelector('#status')?.textContent).toContain('true');

  // toggle it back
  vm.$el.querySelector('#toggle')?.dispatchEvent(new Event('click'));
  vm.$el.querySelector('#change')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('14');
  expect(vm.$el.querySelector('#status')?.textContent).toContain('false');
});

test('variables prop arrangement does not trigger queries', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const variables = ref({
        id: 12,
        type: 'test'
      });

      const { data } = useQuery({
        query: 'query fetchPost($id: ID!) { post (id: $id) { id title } }',
        variables
      });

      return { data, variables };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>{{ data.post.title }}</h1>
      </div>
      <button @click="variables = { type: 'test', id: 12 }"></button>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vm.$el.querySelector('h1')?.textContent).toContain('12');

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('Handles query errors', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data, error } = useQuery({
        query: '{ posts { id title propNotFound } }'
      });

      return { data, error };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`
  });

  await flushPromises();
  expect(vm.$el.querySelector('#error')?.textContent).toMatch(/Cannot query field/);
});

test('Handles external errors', async () => {
  (global as any).fetchController.simulateNetworkError = true;

  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data, error } = useQuery({
        query: '{ posts { id title } }'
      });

      return { data, error };
    },
    template: `
    <div>
      <div v-if="data">
        <h1>It shouldn't work!</h1>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`
  });

  await flushPromises();
  expect(vm.$el.querySelector('#error')?.textContent).toMatch(/Network Error/);
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
    `
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect
    expect(err.message).toContain('Cannot detect villus Client');
  }
});
