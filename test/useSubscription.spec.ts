import flushPromises from 'flush-promises';
import { mount } from './helpers/mount';
import { useClient, useSubscription } from '../src/index';

jest.useFakeTimers();

function makeObservable(throws = false) {
  let interval: any;
  let counter = 0;
  const observable = {
    subscribe: function({ next, error }: { error: Function; next: Function }) {
      interval = setInterval(() => {
        if (throws) {
          error(new Error('oops!'));
          return;
        }

        next({ data: { message: 'New message', id: counter++ } });
      }, 100);

      afterAll(() => {
        clearTimeout(interval);
      });

      return {
        unsubscribe() {
          clearTimeout(interval);
        }
      };
    }
  };

  return observable;
}

test('Handles subscriptions', async () => {
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

      const { data, errors } = useSubscription({ query: `subscription { newMessages }` }, reduce);

      return { messages: data, errors };
    },
    template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <p id="error" v-if="errors">{{ errors[0].message }}</p>
      </div>
    `
  });

  jest.advanceTimersByTime(150);
  await flushPromises();
  expect(vm.$el.querySelector('#error')?.textContent).toBe('oops!');
  vm.$destroy();
});

test('Fails if provider was not resolved', () => {
  try {
    mount({
      setup() {
        const { data, errors } = useSubscription({ query: `subscription { newMessages }` });

        return { messages: data, errors };
      },
      template: `
      <div>
        <ul v-for="message in messages">
          <li>{{ message.id }}</li>
        </ul>
        <p id="error" v-if="errors">{{ errors[0].message }}</p>
      </div>
    `
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect
    expect(err.message).toContain('Cannot detect villus Client');
  }
});
