import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { Subscription, Provider, defaultPlugins, handleSubscriptions } from '../src/index';
import { makeObservable, tick } from './helpers/observer';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test('Handles subscriptions', async () => {
  const client = {
    url: 'https://test.com/graphql',
    use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Subscription,
      Provider,
    },
    template: `
      <Provider v-bind="client">
        <Subscription query="subscription { newMessages }" v-slot="{ data }">
          <div>
            <span>{{ data && data.id }}</span>
          </div>
        </Subscription>
      </Provider>
    `,
  });

  await flushPromises();
  tick(4);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('3');
});

test('can pause and resume subscriptions', async () => {
  const client = {
    url: 'https://test.com/graphql',
    use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
  };

  mount({
    data: () => ({
      client,
      paused: false,
    }),
    components: {
      Subscription,
      Provider,
    },
    template: `
      <Provider v-bind="client">
        <Subscription query="subscription { newMessages }" v-slot="{ data }" :paused="paused">
          <div>
            <span>{{ data && data.id }}</span>
          </div>

          <button @click="paused = !paused">Pause</button>
        </Subscription>
      </Provider>
    `,
  });

  await flushPromises();
  tick(3);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('2');
  document.querySelector('button')?.click();
  await flushPromises();
  tick(10);
  expect(document.querySelector('span')?.textContent).toBe('2');
  document.querySelector('button')?.click();
  await flushPromises();
  tick(7);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).not.toBe('2');
});

test('Can provide a custom reducer', async () => {
  const client = {
    url: 'https://test.com/graphql',
    use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
  };

  function reduce(oldMessages: string[], response: any) {
    if (!response.data) {
      return oldMessages || [];
    }

    return [...oldMessages, response.data.message];
  }

  mount({
    data: () => ({
      client,
      reduce,
    }),
    components: {
      Subscription,
      Provider,
    },
    template: `
      <Provider v-bind="client">
        <Subscription query="subscription { newMessages }" :reduce="reduce" v-slot="{ data }">
          <ul>
            <li v-for="msg in data">{{ msg.id }}</li>
          </ul>
        </Subscription>
      </Provider>
    `,
  });

  await flushPromises();

  tick(5);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(5);
});

test('Handles observer errors', async () => {
  const client = {
    url: 'https://test.com/graphql',
    use: [handleSubscriptions(() => makeObservable(true)), ...defaultPlugins()],
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Subscription,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <Subscription query="subscription { newMessages }" v-slot="{ error }">
            <p v-if="error">{{ error.message }}</p>
          </Subscription>
        </Provider>
      </div>
    `,
  });

  await flushPromises();

  tick(2);
  await flushPromises();
  expect(document.querySelector('p')?.textContent).toContain('oops!');
});

test('Fails if provider was not resolved', async () => {
  try {
    mount({
      components: {
        Subscription,
      },
      template: `
          <Subscription query="subscription { newMessages }" v-slot="{ data }">
            {{ data }}
          </Subscription>
        `,
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
    expect(err.message).toMatch(/Client Provider/);
  }
});
