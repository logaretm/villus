/* eslint-disable no-unused-expressions */
import { mount } from './helpers/mount';
import flushPromises from 'flush-promises';
import { createClient, useQuery, withProvider } from '../src/index';
import { Post } from './server/typedSchema';

test('creates HOC withProvider', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
  });

  mount(
    withProvider(
      {
        setup() {
          const { data, error } = useQuery<{ posts: Post[] }>({ query: '{ posts { id title } }' });

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

  expect(document.querySelectorAll('li').length).toBe(5);
});
