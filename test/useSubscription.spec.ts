/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { mount } from './helpers/mount';
import { makeObservable } from './helpers/observer';
import { useClient, useSubscription } from '../src/index';

jest.useFakeTimers();

test('Default reducer', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        subscriptionForwarder: () => {
          return makeObservable();
        }
      });

      const { data } = useSubscription({ query: `subscription { newMessages }` });

      return { messages: data };
    },
    template: `
      <div>
        <div v-if="messages">
          <span>{{ messages.id }}</span>
        </div>
      </div>
    `
  });

  jest.advanceTimersByTime(501);
  await flushPromises();
  expect(vm.$el.querySelector('span')?.textContent).toBe('4');
  vm.$destroy();
});

test('Handles subscriptions with a custom reducer', async () => {
  const vm = mount({
    setup() {
      useClient({
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

      const { data } = useSubscription({ query: `subscription { newMessages }` }, reduce);

      return { messages: data };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
      </div>
    `
  });

  jest.advanceTimersByTime(501);
  await flushPromises();
  expect(vm.$el.querySelectorAll('li')).toHaveLength(5);
  vm.$destroy();
});

test('Handles observer errors', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        subscriptionForwarder: () => {
          return makeObservable(true);
        }
      });

      function reduce(oldMessages: string[], response: any) {
        if (!response.data) {
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
    `
  });

  jest.advanceTimersByTime(150);
  await flushPromises();
  expect(vm.$el.querySelector('#error')?.textContent).toContain('oops!');
  vm.$destroy();
});

test('Pauses and resumes subscriptions', async () => {
  const vm = mount({
    setup() {
      useClient({
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

      const { data, pause, resume, paused } = useSubscription({ query: `subscription { newMessages }` }, reduce);

      return { messages: data, pause, resume, paused };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <button @click="paused ? resume() : pause()"></button>
        <span id="status">{{ paused }}</span>
      </div>
    `
  });

  await flushPromises();
  jest.advanceTimersByTime(201);
  // pauses subscription
  expect(vm.$el.querySelector('#status')?.textContent).toBe('false');
  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(vm.$el.querySelectorAll('li')).toHaveLength(2);
  expect(vm.$el.querySelector('#status')?.textContent).toBe('true');
  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  jest.advanceTimersByTime(201);
  await flushPromises();

  expect(vm.$el.querySelectorAll('li')).toHaveLength(4);
  expect(vm.$el.querySelector('#status')?.textContent).toBe('false');
  vm.$destroy();
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
        <p id="error" v-if="error">{{ error.message }}</p>
      </div>
    `
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect
    expect(err.message).toContain('Cannot detect villus Client');
  }
});
