/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import { useClient, useMutation } from '../src/index';
import { computed } from 'vue';
import {
  LikePostMutation,
  MutationWithNetworkError,
  MutationWithParseError,
  MutationWithGqlError,
} from './mocks/queries';
import flushPromises from 'flush-promises';
import waitForExpect from 'wait-for-expect';

test('runs mutations', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation<{ likePost: { id: number; title: string } }>(LikePostMutation);

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.title }}</p>
      </div>
      <button @click="execute()"></button>
    </div>`,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('p')?.textContent).toContain('Awesome Post');
  });
});

test('passes variables via execute method', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation(LikePostMutation);

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <button @click="execute({ id: 123 })"></button>
    </div>`,
  });

  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('p')?.textContent).toBe('123');
  });
});

test('handles parse errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithParseError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toMatch(/invalid json response body/);
  });
});

test('handles mutation errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithGqlError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toContain('Not authenticated');
  });
});

test('handles network errors', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute, error } = useMutation(MutationWithNetworkError);

      return { data, execute, error };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <p id="error" v-if="error">{{ error.message }}</p>
      <button @click="execute()"></button>
    </div>`,
  });

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelector('#error')?.textContent).toContain('Failed to connect');
  });
});

test('Fails if provider was not resolved', async () => {
  try {
    mount({
      setup() {
        const { data, execute } = useMutation(LikePostMutation);

        return { data, execute };
      },
      template: `
        <div>
          <div v-if="data">
            <p>{{ data.likePost.message }}</p>
          </div>
          <button @click="execute()"></button>
        </div>`,
    });
  } catch (err) {
    await waitForExpect(() => {
      // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
      expect(err.message).toContain('Cannot detect villus Client');
    });
  }
});

test('runs mutations with custom headers per mutation', async () => {
  const ctx = {
    'SOME-AUTH-HEADER': 'OH YEA',
  };
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
      });

      const { data, execute } = useMutation(LikePostMutation, {
        context: computed(() => {
          return {
            headers: ctx,
          };
        }),
      });

      return { data, execute };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.likePost.id }}</p>
      </div>
      <button @click="execute()"></button>
    </div>`,
  });

  await flushPromises();
  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();

  await waitForExpect(() => {
    expect(fetch).toHaveBeenCalledWith(
      'https://test.com/graphql',
      expect.objectContaining({
        url: 'https://test.com/graphql',
        body: expect.anything(),
        method: 'POST',
        headers: expect.objectContaining(ctx),
      })
    );
  });
});
