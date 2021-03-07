import fetch from 'node-fetch';

let fetchSpy: any;

export const fetchMock = {
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (!global.fetch) {
      global.fetch = fetch as any;
    }

    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(fetch as any);
  },
  teardown() {
    fetchSpy.mockRestore();
  },
};
