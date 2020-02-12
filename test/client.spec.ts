import { createClient } from '../src/index';

test('fails if a fetcher was not provided', () => {
  (global as any).fetch = undefined;
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    createClient({ fetch: null });
  }).toThrow(/Could not resolve/);
});

test('fails if executes an non-provided query', async () => {
  try {
    const client = createClient({
      url: ''
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await client.executeQuery({ query: null });
  } catch (err) {
    // eslint-disable-next-line jest/no-try-expect
    expect(err.message).toMatch(/A query must be provide/);
  }
});

test('supports async context', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    context: async () => {
      return {
        fetchOptions: {
          headers: {
            Authorization: 'bearer TOKEN'
          }
        }
      };
    }
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const { data } = await client.executeQuery({ query: '{ posts { id title } }' });

  expect(data).toBeDefined();
});
