/* eslint-disable no-unused-expressions */
import flushPromises from 'flush-promises';
import { test, expect, vi, beforeEach, afterEach, describe } from 'vitest';
import { rest } from 'msw';
import { server } from '../../villus/test/mocks/server';
import { batch } from '../src/index';
import { mount } from '../../villus/test/helpers/mount';
import { useClient, useQuery, definePlugin } from '../../villus/src';
import waitForExpect from 'wait-for-expect';
import { PostQuery, PostsQuery, QueryErrorWith500, QueryWithNetworkError } from 'villus/test/mocks/queries';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
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

    vi.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    vi.useRealTimers();
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

    vi.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    vi.useRealTimers();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('#multi')?.children).toHaveLength(5);
      expect(document.querySelector('#error')?.textContent).toContain('Not authenticated');
    });
  });

  test('null json responses should be handled', async () => {
    server.use(
      rest.post('https://test.com/graphql', async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(null));
      })
    );

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [batch()],
        });

        const firstQuery = useQuery({ query: PostsQuery });

        return { error: firstQuery.error };
      },
      template: `
    <div>
      <p v-if="error" id="error">{{  error.message }}</p>
    </div>`,
    });

    vi.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    vi.useRealTimers();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(document.querySelector('#error')?.textContent).toContain('empty response');
    });

    server.resetHandlers();
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

    vi.advanceTimersByTime(100);
    await flushPromises();
    // wait-for-expect uses timers under the hood, so we need to reset here
    vi.useRealTimers();
    await waitForExpect(() => {
      expect(document.querySelector('#error')?.textContent).toContain('Failed to connect');
    });
  });

  test('can set batched queries limit with maxOperationCount', async () => {
    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [
            batch({
              maxOperationCount: 2,
            }),
          ],
        });

        useQuery({ query: PostsQuery });
        useQuery({ query: PostQuery });
        useQuery({ query: PostQuery, variables: { id: 1 } });
        useQuery({ query: PostQuery, variables: { id: 2 } });
        useQuery({ query: PostQuery, variables: { id: 3 } });

        return {};
      },
      template: `<div></div>`,
    });

    vi.advanceTimersByTime(100);
    await flushPromises();

    vi.useRealTimers();
    await waitForExpect(() => {
      // we've set the limit to 2, so 5 queries will be executed over 3 HTTP calls
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  // #166
  test('can set fetch options', async () => {
    const headerPlugin = definePlugin(({ opContext }) => {
      opContext.headers['X-CUSTOM-HEADER'] = 'TEST';
      opContext.credentials = 'include';
    });

    mount({
      setup() {
        useClient({
          url: 'https://test.com/graphql',
          use: [headerPlugin, batch()],
        });

        useQuery({ query: PostsQuery });

        return {};
      },
      template: `<div></div>`,
    });

    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    // wait-for-expect uses timers under the hood, so we need to reset here
    vi.useRealTimers();
    await waitForExpect(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'X-CUSTOM-HEADER': 'TEST',
          }),
        })
      );
    });
  });
});
