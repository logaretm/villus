import flushPromises from 'flush-promises';
import { test, expect, vi } from 'vitest';
import gql from 'graphql-tag';
import { mount } from './helpers/mount';
import { makeObservable, tick } from './helpers/observer';
import { defaultPlugins, handleSubscriptions, useClient, useSubscription } from '../src/index';
import { computed, ref } from 'vue';
import { print } from 'graphql';
import { createClient } from 'graphql-ws';

vi.useFakeTimers();

interface Message {
  id: number;
  message: string;
}

test('Default reducer', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      const { data } = useSubscription<Message>({ query: `subscription { newMessages }` });

      return { messages: data };
    },
    template: `
      <div>
        <div v-if="messages">
          <span>{{ messages.id }}</span>
        </div>
      </div>
    `,
  });

  await flushPromises();
  vi.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('4');
});

test('Re-executes subscriptions if query changes', async () => {
  const unSubSpy = vi.fn();
  const subSpy = vi.fn(() => ({
    subscribe() {
      return {
        unsubscribe: unSubSpy,
      };
    },
  }));

  const id = ref(0);

  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(subSpy), ...defaultPlugins()],
      });

      const query = computed(() => {
        return `subscription (id: ${id.value}) { newMessages }`;
      });

      const { data } = useSubscription<Message>({ query });

      return { messages: data };
    },
    template: `<div></div>`,
  });

  await flushPromises();
  expect(subSpy).toHaveBeenCalledTimes(1);
  expect(unSubSpy).not.toHaveBeenCalled();
  id.value++;
  await flushPromises();
  expect(unSubSpy).toHaveBeenCalledTimes(1);
  expect(subSpy).toHaveBeenCalledTimes(2);
});

test('Re-executes subscriptions if variables changes', async () => {
  const unSubSpy = vi.fn();
  const subSpy = vi.fn(() => ({
    subscribe() {
      return {
        unsubscribe: unSubSpy,
      };
    },
  }));

  const id = ref(0);

  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(subSpy), ...defaultPlugins()],
      });

      const variables = computed(() => {
        return {
          id: id.value,
        };
      });

      const { data } = useSubscription<Message>({ query: `subscription { newMessages }`, variables });

      return { messages: data };
    },
    template: `<div></div>`,
  });

  await flushPromises();
  expect(subSpy).toHaveBeenCalledTimes(1);
  expect(unSubSpy).not.toHaveBeenCalled();
  id.value++;
  await flushPromises();
  expect(unSubSpy).toHaveBeenCalledTimes(1);
  expect(subSpy).toHaveBeenCalledTimes(2);
});

test('Handles subscriptions with a custom reducer', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      const { data } = useSubscription<Message, string[]>(
        { query: `subscription { newMessages }` },
        (response, oldMessages) => {
          if (!response.data || !oldMessages) {
            return oldMessages || [];
          }

          return [...oldMessages, response.data.message];
        },
      );

      return { messages: data };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
      </div>
    `,
  });

  await flushPromises();
  vi.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(5);
});

test('Handles observer errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable(true)), ...defaultPlugins()],
      });

      function reduce(response: any, oldMessages: string[] | null): string[] {
        if (!response.data || !oldMessages) {
          return oldMessages || [];
        }

        return [...oldMessages, response.data.message];
      }

      const { data, error } = useSubscription({ query: `subscription { newMessages }` }, reduce);

      return { messages: data, error };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <p id="error" v-if="error">{{ error.message }}</p>
      </div>
    `,
  });

  await flushPromises();
  vi.advanceTimersByTime(150);
  await flushPromises();
  expect(document.querySelector('#error')?.textContent).toContain('oops!');
});

test('Pauses and resumes subscriptions', async () => {
  const paused = ref(false);
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      function reduce(response: any, oldMessages: string[] | null) {
        if (!response.data || !oldMessages) {
          return oldMessages || [];
        }

        return [...oldMessages, response.data.message];
      }

      const { data, paused: isPaused } = useSubscription({ query: `subscription { newMessages }`, paused }, reduce);

      return { messages: data, isPaused };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <span id="status">{{ isPaused }}</span>
      </div>
    `,
  });

  await flushPromises();
  vi.advanceTimersByTime(201);
  // pauses subscription
  expect(document.querySelector('#status')?.textContent).toBe('false');
  paused.value = true;
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(2);
  expect(document.querySelector('#status')?.textContent).toBe('true');
  paused.value = false;
  await flushPromises();
  vi.advanceTimersByTime(201);
  await flushPromises();

  expect(document.querySelectorAll('li')).toHaveLength(4);
  expect(document.querySelector('#status')?.textContent).toBe('false');
});

test('Can pause subscriptions initially', async () => {
  const paused = ref(true);
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      function reduce(response: any, oldMessages: string[] | null) {
        if (!response.data || !oldMessages) {
          return oldMessages || [];
        }

        return [...oldMessages, response.data.message];
      }

      const { data, paused: isPaused } = useSubscription({ query: `subscription { newMessages }`, paused }, reduce);

      return { messages: data, isPaused };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <span id="status">{{ isPaused }}</span>
      </div>
    `,
  });

  await flushPromises();
  vi.advanceTimersByTime(201);
  // pauses subscription
  expect(document.querySelector('#status')?.textContent).toBe('true');
  vi.advanceTimersByTime(201);
  expect(document.querySelectorAll('li')).toHaveLength(0);
  paused.value = false;
  await flushPromises();
  expect(document.querySelector('#status')?.textContent).toBe('false');
  vi.advanceTimersByTime(201);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(2);
});

test('Skips subscribing if skip is true', async () => {
  const unSubSpy = vi.fn();
  const subSpy = vi.fn(() => ({
    subscribe() {
      return {
        unsubscribe: unSubSpy,
      };
    },
  }));

  const id = ref(0);

  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(subSpy), ...defaultPlugins()],
      });

      const query = `subscription (id) { newMessages }`;

      const { data } = useSubscription<Message>({ query, variables: () => ({ id: id.value }), skip: ({ id }) => !id });

      return { messages: data };
    },
    template: `<div></div>`,
  });

  await flushPromises();
  expect(subSpy).not.toHaveBeenCalled();
  expect(unSubSpy).not.toHaveBeenCalled();
  id.value++;
  await flushPromises();
  expect(subSpy).toHaveBeenCalledTimes(1);
  expect(unSubSpy).toHaveBeenCalledTimes(0);
  id.value--;
  await flushPromises();
  expect(subSpy).toHaveBeenCalledTimes(1);
  expect(unSubSpy).toHaveBeenCalledTimes(1);
});

test('Fails if provider was not resolved', () => {
  try {
    mount({
      setup() {
        const { data, error } = useSubscription({ query: `subscription { newMessages }` });

        return { messages: data, error };
      },
      template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <p id="error" v-if="errors">{{ error.message }}</p>
      </div>
    `,
    });
  } catch (err) {
    expect((err as Error).message).toContain('Cannot detect villus Client');
  }
});

test('Fails if subscription forwarder was not set', () => {
  try {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [handleSubscriptions(null as any)],
        });
        const { data, error } = useSubscription({ query: `subscription { newMessages }` });

        return { messages: data, error };
      },
      template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <p id="error" v-if="error">{{ error.message }}</p>
      </div>
    `,
    });
  } catch (err) {
    expect((err as Error).message).toContain('No subscription forwarder was set');
  }
});

test('handles subscription errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable(false, true)), ...defaultPlugins()],
      });

      const { data, error } = useSubscription<Message>({ query: `subscription { newMessages }` });

      return { messages: data.value, error };
    },
    template: `
      <div>
        <div v-if="messages && !error">
          <span>{{ messages.id }}</span>
        </div>
        <span id="error" v-if="error">{{ error }}</span>
      </div>
    `,
  });

  await flushPromises();
  await tick(1);
  await flushPromises();
  expect(document.querySelector('#error')?.textContent).toBeTruthy();
});

test('normalizes subscription queries', async () => {
  const spy = vi.fn();
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [
          handleSubscriptions(op => {
            spy(op.query);

            return makeObservable();
          }),
          ...defaultPlugins(),
        ],
      });

      const { data, error } = useSubscription<Message>({
        query: gql`
          subscription {
            newMessages
          }
        `,
        variables: { id: 2 },
      });

      return { messages: data.value, error };
    },
    template: `
      <div>
        <div v-if="messages && !error">
          <span>{{ messages.id }}</span>
        </div>
        <span id="error" v-if="error">{{ error }}</span>
      </div>
    `,
  });

  await flushPromises();
  await tick(1);
  await flushPromises();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(
    print(gql`
      subscription {
        newMessages
      }
    `),
  );
});

test('ensure type compatability with graphql-ws', async () => {
  const wsClient = createClient({
    url: 'ws://localhost:9005/graphql',
  });

  const subscriptionForwarder = handleSubscriptions(operation => {
    return {
      subscribe: obs => {
        wsClient.subscribe(
          {
            query: operation.query,
            variables: operation.variables,
          },
          obs,
        );

        return {
          unsubscribe: () => {
            // No OP
          },
        };
      },
    };
  });

  expect(subscriptionForwarder).toBeTruthy();
  useClient({
    url: 'https://test.com/graphql',
    use: [subscriptionForwarder],
  });
});

test('Allows providing initial data', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      const { data } = useSubscription<Message>({
        query: `subscription { newMessages }`,
        initialData: { id: 1, message: 'initial' },
      });

      return { data };
    },
    template: `
      <div>
          <span>{{ data.message }}</span>
      </div>
    `,
  });

  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('initial');
  vi.advanceTimersByTime(101);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('New message');
});

test('isFetching is set to true until initial data is received', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      const { isFetching } = useSubscription<Message>({
        query: `subscription { newMessages }`,
      });

      return { isFetching };
    },
    template: `
      <div>
          <span>{{ isFetching }}</span>
      </div>
    `,
  });

  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('true');
  vi.advanceTimersByTime(101);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('false');
});

test('can subscribe/unsubscribe on demand', async () => {
  const unSubSpy = vi.fn();
  const subSpy = vi.fn(() => {
    const obs = makeObservable();

    return {
      subscribe(...args: any[]) {
        const { unsubscribe: unsub } = (obs as any).subscribe(...args);

        return {
          unsubscribe: () => {
            unSubSpy();
            unsub();
          },
        };
      },
    };
  });

  let subscription!: ReturnType<typeof useSubscription>;
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(subSpy), ...defaultPlugins()],
      });

      subscription = useSubscription<Message>({
        query: `subscription { newMessages }`,
        subscribeOnMount: false,
      });

      return { messages: subscription.data };
    },
    template: `
      <div>
        <div v-if="messages">
          <span>{{ messages.id }}</span>
        </div>
      </div>
    `,
  });

  await flushPromises();
  await expect(subSpy).not.toHaveBeenCalled();
  subscription?.subscribe();
  await flushPromises();
  await expect(subSpy).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('4');
  subscription?.unsubscribe();
  await flushPromises();
  await expect(unSubSpy).toHaveBeenCalledTimes(1);
});
