/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { batch } from '../src/index';
import { mount } from '../../villus/test/helpers/mount';
import { useClient, useQuery } from '../../villus/src';
import waitForExpect from 'wait-for-expect';
import { PostQuery, PostsQuery, QueryErrorWith500, QueryWithNetworkError } from 'villus/test/mocks/queries';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('batch plugin', () => {
  test('batches queries with batcher', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const firstQuery = useQuery({ query: PostsQuery });
        const secondQuery = useQuery({ query: PostQuery });

        return { postsWithTitle: firstQuery.data, postsWithId: secondQuery.data };
      },
      template: `
    <div>
      <ul v-if="postsWithTitle" id="multi">
        <li v-for="post in postsWithTitle.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <p v-if="postsWithId" id="single">{{  postsWithId.post.title }}</p>
    </div>`,
    });

    jest.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    jest.useRealTimers();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('#multi')?.children).toHaveLength(5);
      expect(document.querySelector('#single')?.textContent).toContain('Awesome');
    });
  });

  test('results with non-200 code will be evaluated separately', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const firstQuery = useQuery({ query: PostsQuery });
        const secondQuery = useQuery({ query: QueryErrorWith500 });

        return { postsWithTitle: firstQuery.data, secondQueryError: secondQuery.error };
      },
      template: `
    <div>
      <ul v-if="postsWithTitle" id="multi">
        <li v-for="post in postsWithTitle.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <p v-if="secondQueryError" id="error">{{  secondQueryError.message }}</p>
    </div>`,
    });

    jest.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    jest.useRealTimers();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('#multi')?.children).toHaveLength(5);
      expect(document.querySelector('#error')?.textContent).toContain('Not authenticated');
    });
  });

  test('handles network errors', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const { error } = useQuery({ query: QueryWithNetworkError });

        return { error };
      },
      template: `
    <div>
      <p id="error" v-if="error">{{ error.message }}</p>
    </div>`,
    });

    jest.advanceTimersByTime(100);
    await flushPromises();
    // wait-for-expect uses timers under the hood, so we need to reset here
    jest.useRealTimers();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toContain('Failed to connect');
    });
  });
});
