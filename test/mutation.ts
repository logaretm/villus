import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { Mutation, createClient, Provider } from '../src/index';

test('runs mutations', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
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
  expect(fetch).toBeCalledTimes(0);

  wrapper.find('button').trigger('click');
  await flushPromises();
  // cache was used.
  expect(fetch).toBeCalledTimes(1);
  expect(wrapper.find('p').text()).toBe('Operation successful');
});
