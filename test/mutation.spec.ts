import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { Mutation, createClient, Provider } from '../src/index';

test('runs mutations', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Mutation,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
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
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(0);

  wrapper.find('button').trigger('click');
  await flushPromises();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(wrapper.find('p').text()).toBe('Operation successful');
});

test('handles errors', async () => {
  const client = createClient({
    url: 'https://test.com/graphql'
  });

  (global as any).fetchController.simulateNetworkError = true;

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Mutation,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
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
    `
    },
    { sync: false }
  );

  wrapper.find('button').trigger('click');
  await flushPromises();
  expect(wrapper.find('p').text()).toContain('Network Error');
});
