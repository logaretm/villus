/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { Mutation, createClient, Provider } from '../src/index';

test('runs mutations', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount({
    data: () => ({
      client,
    }),
    components: {
      Mutation,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ data, execute }">
              <div v-if="data">
                <p>{{ data.likePost.message }}</p>
              </div>
              <button @click="execute()"></button>
            </Mutation>
          </div>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(0);

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.querySelector('p')?.textContent).toBe('Operation successful');
});

test('handles errors', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  (global as any).fetchController.simulateNetworkError = true;

  mount({
    data: () => ({
      client,
    }),
    components: {
      Mutation,
      Provider,
    },
    template: `
      <div>
        <Provider v-bind="client">
          <div>
            <Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ error, execute }">
              <div v-if="error">
                <p>{{ error.message }}</p>
              </div>
              <button @click="execute()"></button>
            </Mutation>
          </div>
        </Provider>
      </div>
    `,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  expect(document.querySelector('p')?.textContent).toContain('Network Error');
});
