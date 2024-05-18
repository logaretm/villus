import flushPromises from 'flush-promises';
import { test, expect } from 'vitest';
import { multipart } from '../src/index';
import { mount } from '../../villus/test/helpers/mount';
import { useClient, useMutation, fetch } from '../../villus/src';

const content = { hello: 'world' };
const file = new File([new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })], 'index.ts');

test('handles single file uploads', async () => {
  mount({
    setup() {
      useClient({
        url: 'https://test.com/graphql',
        use: [multipart(), fetch()],
      });

      const { data, error, execute } = useMutation(
        'mutation Upload ($file: Upload!) { singleUpload (file: $file) { path } }',
      );

      async function upload() {
        await execute({
          file,
        });
      }

      return { data, error, upload };
    },
    template: `
    <div>
      <div v-if="data">
        <p>{{ data.singleUpload.path }}</p>
        </div>
        <p>{{error }}</p>
      <button @click="upload()"></button>
    </div>`,
  });

  await flushPromises();

  document.querySelector('button')?.dispatchEvent(new Event('click'));
  await flushPromises();

  expect(global.fetch).toHaveBeenCalledWith(
    'https://test.com/graphql',
    expect.objectContaining({
      url: 'https://test.com/graphql',
      body: expect.any(FormData),
      method: 'POST',
      headers: expect.objectContaining({}),
    }),
  );
});
