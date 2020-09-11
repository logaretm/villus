import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { Subscription, createClient, Provider } from '../src/index';
import { makeObservable } from './helpers/observer';

test('Handles subscriptions', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable();
    }
  });

  mount({
    data: () => ({
      client
    }),
    components: {
      Subscription,
      Provider
    },
    template: `
      <Provider :client="client">
        <Subscription query="subscription { newMessages }" v-slot="{ data }">
          <div>
            <span>{{ data.id }}</span>
          </div>
        </Subscription>
      </Provider>
    `
  });

  await (global as any).sleep(510);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('4');
});

test('Can provide a custom reducer', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable();
    }
  });

  function reduce(oldMessages: string[], response: any) {
    if (!response.data) {
      return oldMessages || [];
    }

    return [...oldMessages, response.data.message];
  }

  mount({
    data: () => ({
      client,
      reduce
    }),
    components: {
      Subscription,
      Provider
    },
    template: `
      <Provider :client="client">
        <Subscription query="subscription { newMessages }" :reduce="reduce" v-slot="{ data }">
          <ul>
            <li v-for="msg in data">{{ msg.id }}</li>
          </ul>
        </Subscription>
      </Provider>
    `
  });

  await (global as any).sleep(510);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(5);
});

test('Handles observer errors', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable(true);
    }
  });

  mount({
    data: () => ({
      client
    }),
    components: {
      Subscription,
      Provider
    },
    template: `
      <div>
        <Provider :client="client">
          <Subscription query="subscription { newMessages }" v-slot="{ error }">
            <p v-if="error">{{ error.message }}</p>
          </Subscription>
        </Provider>
      </div>
    `
  });

  await (global as any).sleep(150);
  await flushPromises();
  expect(document.querySelector('p')?.textContent).toContain('oops!');
});

test('Fails if provider was not resolved', async () => {
  try {
    mount({
      components: {
        Subscription
      },
      template: `
          <Subscription query="subscription { newMessages }" v-slot="{ data }">
            {{ data }}
          </Subscription>
        `
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
    expect(err.message).toMatch(/Client Provider/);
  }
});
