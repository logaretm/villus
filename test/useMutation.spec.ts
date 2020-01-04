/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { useClient, useMutation } from '../src/index';

test('runs mutations', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data, execute } = useMutation({ query: 'mutation { likePost (id: 123) { message } }' });

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.message }}</p>
      </div>
      <button @click="execute()"></button>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(0);

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  expect(vm.$el.querySelector('p')?.textContent).toBe('Operation successful');
});

test('passes variables via execute method', async () => {
  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data, execute } = useMutation({
        query: 'mutation LikePost ($id: ID!) { likePost (id: $id) { message } }'
      });

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.message }}</p>
      </div>
      <button @click="execute({ id: 123 })"></button>
    </div>`
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(0);

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);

  expect(vm.$el.querySelector('p')?.textContent).toBe('Operation successful');
});

test('handles external errors', async () => {
  (global as any).fetchController.simulateNetworkError = true;

  const vm = mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql'
      });

      const { data, execute, errors } = useMutation({ query: 'mutation { likePost (id: 123) { message } }' });

      return { data, execute, errors };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.message }}</p>
      </div>
      <p id="error" v-if="errors">{{ errors[0].message }}</p>
      <button @click="execute()"></button>
    </div>`
  });

  vm.$el.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(vm.$el.querySelector('#error')?.textContent).toBe('Network Error');
});

test('Fails if provider was not resolved', () => {
  try {
    mount({
      setup() {
        const { data, execute } = useMutation({ query: 'mutation { likePost (id: 123) { message } }' });

        return { data, execute };
      },
      template: `
        <div>
          <div v-if="data">
            <p>{{ data.likePost.message }}</p>
          </div>
          <button @click="execute()"></button>
        </div>`
    });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect
    expect(err.message).toContain('Cannot detect villus Client');
  }
});
