import { vi } from 'vitest';
import fetch from 'node-fetch';

let fetchSpy: any;

export const fetchMock = {
  setup() {
    global.fetch = fetch as any;

    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(fetch as any);
  },
  teardown() {
    fetchSpy.mockRestore();
  },
};
