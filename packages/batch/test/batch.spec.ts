/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { batch } from '../src/index';
import { mount } from '../../villus/test/helpers/mount';
import { useClient, useQuery } from '../../villus/src';

describe('batch plugin', () => {
  test('batches queries with batcher', async () => {
    jest.useFakeTimers();
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const firstQuery = useQuery({ query: '{ posts { title } }' });
        const secondQuery = useQuery({ query: '{ posts { id } }' });

        return { postsWithTitle: firstQuery.data, postsWithId: secondQuery.data };
      },
      template: `
    <div>
      <ul v-if="postsWithTitle">
        <li v-for="post in postsWithTitle.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <ul v-if="postsWithId">
        <li v-for="post in postsWithId.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
    });

    jest.advanceTimersByTime(100);
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test('handles network errors', async () => {
    jest.useFakeTimers();
    (global as any).fetchController.simulateNetworkError = true;
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const { error } = useQuery({ query: '{ posts { title } }' });

        return { error };
      },
      template: `
    <div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`,
    });

    jest.advanceTimersByTime(100);
    await flushPromises();
    expect(document.querySelector('#error')?.textContent).toMatch(/Network Error/);
    jest.useRealTimers();
  });
});
