import { defaultPlugins } from '../src/client';
import { createClient } from '../src/index';
import { ClientPlugin } from '../src/types';

test('fails if a fetcher was not provided', () => {
  (global as any).fetch = undefined;
  expect(() => {
    // @ts-expect-error Checking for run-time error
    createClient({ fetch: null });
  }).toThrow(/Could not resolve/);
});

test('fails if executes an non-provided query', async () => {
  try {
    const client = createClient({
      url: '',
    });

    // @ts-expect-error Checking for run-time error
    await client.executeQuery({ query: null });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
    expect(err.message).toMatch(/A query must be provide/);
  }
});

test('supports async plugins', async () => {
  const auth: ClientPlugin = async ({ setOperationContext }) => {
    setOperationContext({
      headers: {
        Authorization: 'bearer TOKEN',
      },
    });
  };

  const client = createClient({
    url: 'https://test.com/graphql',
    use: [auth, ...defaultPlugins()],
  });

  const { data } = await client.executeQuery({ query: '{ posts { id title } }' });

  expect(data).toBeDefined();
});

test('throws if no plugins set the result for the operation', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    use: [],
  });

  await expect(client.executeQuery({ query: '{ posts { id title } }' })).rejects.toThrowError(
    'Operation result was not set by any plugin, make sure you have default plugins configured or review documentation'
  );
});
