/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { Mutation, Provider } from '../src/index';
import waitForExpect from 'wait-for-expect';
import { LikePostMutation, MutationWithNetworkError } from './mocks/queries';

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
            <Mutation query="${LikePostMutation}" v-slot="{ data, execute }">
              <div v-if="data">
                <p>{{ data.likePost.title }}</p>
              </div>
              <button @click="execute()"></button>
            </Mutation>
          </div>
        </Provider>
      </div>
    `,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('p')?.textContent).toContain('Awesome');
  });
});

test('handles errors', async () => {
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
            <Mutation query="${MutationWithNetworkError}" v-slot="{ error, execute }">
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
  await waitForExpect(() => {
    expect(document.querySelector('p')?.textContent).toContain('Failed to connect');
  });
});
