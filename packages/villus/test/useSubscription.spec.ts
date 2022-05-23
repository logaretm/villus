/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { mount } from './helpers/mount';
import { makeObservable, tick } from './helpers/observer';
import { defaultPlugins, handleSubscriptions, useClient, useSubscription } from '../src/index';
import { computed, ref } from 'vue';

jest.useFakeTimers();

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
  jest.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('4');
});

test('Re-executes subscriptions if query changes', async () => {
  const unSubSpy = jest.fn();
  const subSpy = jest.fn(() => ({
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
  await flushPromises();
  expect(unSubSpy).toHaveBeenCalledTimes(1);
  expect(subSpy).toHaveBeenCalledTimes(2);
});

test('Re-executes subscriptions if variables changes', async () => {
  const unSubSpy = jest.fn();
  const subSpy = jest.fn(() => ({
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
        (oldMessages, response) => {
          if (!response.data || !oldMessages) {
            return oldMessages || [];
          }

          return [...oldMessages, response.data.message];
        }
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
  jest.advanceTimersByTime(501);
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

      function reduce(oldMessages: string[] | null, response: any): string[] {
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
  jest.advanceTimersByTime(150);
  await flushPromises();
  expect(document.querySelector('#error')?.textContent).toContain('oops!');
});

test('Pauses and resumes subscriptions', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      function reduce(oldMessages: string[] | null, response: any) {
        if (!response.data || !oldMessages) {
          return oldMessages || [];
        }

        return [...oldMessages, response.data.message];
      }

      const { data, pause, resume, isPaused } = useSubscription({ query: `subscription { newMessages }` }, reduce);

      return { messages: data, pause, resume, isPaused };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <button @click="isPaused ? resume() : pause()"></button>
        <span id="status">{{ isPaused }}</span>
      </div>
    `,
  });

  await flushPromises();
  jest.advanceTimersByTime(201);
  // pauses subscription
  expect(document.querySelector('#status')?.textContent).toBe('false');
  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(2);
  expect(document.querySelector('#status')?.textContent).toBe('true');
  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  jest.advanceTimersByTime(201);
  await flushPromises();

  expect(document.querySelectorAll('li')).toHaveLength(4);
  expect(document.querySelector('#status')?.textContent).toBe('false');
});

test('Can pause subscriptions initially', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [handleSubscriptions(() => makeObservable()), ...defaultPlugins()],
      });

      function reduce(oldMessages: string[] | null, response: any) {
        if (!response.data || !oldMessages) {
          return oldMessages || [];
        }

        return [...oldMessages, response.data.message];
      }

      const { data, resume, isPaused } = useSubscription(
        { query: `subscription { newMessages }`, paused: true },
        reduce
      );

      return { messages: data, resume, isPaused };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <button @click="resume"></button>
        <span id="status">{{ isPaused }}</span>
      </div>
    `,
  });

  await flushPromises();
  jest.advanceTimersByTime(201);
  // pauses subscription
  expect(document.querySelector('#status')?.textContent).toBe('true');
  jest.advanceTimersByTime(201);
  expect(document.querySelectorAll('li')).toHaveLength(0);
  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(document.querySelector('#status')?.textContent).toBe('false');
  jest.advanceTimersByTime(201);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(2);
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
