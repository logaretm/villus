/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { mount } from './helpers/mount';
import { makeObservable } from './helpers/observer';
import { useClient, useSubscription } from '../src/index';

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
        subscriptionForwarder: () => {
          return makeObservable();
        },
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

  jest.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelector('span')?.textContent).toBe('4');
});

test('Handles subscriptions with a custom reducer', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        subscriptionForwarder: () => {
          return makeObservable();
        },
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

  jest.advanceTimersByTime(501);
  await flushPromises();
  expect(document.querySelectorAll('li')).toHaveLength(5);
});

test('Handles observer errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        subscriptionForwarder: () => {
          return makeObservable(true);
        },
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

  jest.advanceTimersByTime(150);
  await flushPromises();
  expect(document.querySelector('#error')?.textContent).toContain('oops!');
});

test('Pauses and resumes subscriptions', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        subscriptionForwarder: () => {
          return makeObservable();
        },
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
  jest.advanceTimersByTime(201);
  await flushPromises();

  expect(document.querySelectorAll('li')).toHaveLength(4);
  expect(document.querySelector('#status')?.textContent).toBe('false');
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
    // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
    expect(err.message).toContain('Cannot detect villus Client');
  }
});

test('Fails if subscription forwarder was not set', () => {
  try {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
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
    // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
    expect(err.message).toContain('No subscription forwarder was set');
  }
});
