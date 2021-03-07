import { server } from './mocks/server';
import { fetchMock } from './mocks/fetch';

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.setup();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  fetchMock.teardown();
});

// Clean up after the tests are finished.
afterAll(() => server.close());
