/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { useQuery, withProvider } from '../src/index';
import waitForExpect from 'wait-for-expect';

test('creates HOC withProvider', async () => {
  const client = {
    url: 'https://test.com/graphql',
  };

  mount(
    withProvider(
      {
        setup() {
          const { data, error } = useQuery({ query: 'query Posts { posts { id title } }' });

          return { data, error };
        },
        template: `
    <div>'
      <div>{{ error }}</div>
      <ul v-if="data">
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>`,
      },
      client
    )
  );

  await flushPromises();
  await waitForExpect(() => {
    expect(document.querySelectorAll('li').length).toBe(5);
  });
});
