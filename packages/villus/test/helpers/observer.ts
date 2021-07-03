let interval: any;
export function makeObservable(throws = false, simulateError = false) {
  let counter = 0;
  const observable = {
    subscribe({ next, error }: { error: (err: Error) => any; next: (value: any) => any }) {
      interval = setInterval(() => {
        if (throws) {
          error(new Error('oops!'));
          return;
        }

        if (!simulateError) {
          next({ data: { message: 'New message', id: counter++ } });
          return;
        }

        next({ errors: [new Error('sadge')], data: null });
      }, 100);

      return {
        unsubscribe() {
          clearTimeout(interval);
        },
      };
    },
  };

  return observable;
}

afterAll(() => {
  clearTimeout(interval);
});

export function tick(ticks = 1) {
  jest.advanceTimersByTime(ticks * 100 + 1);
}
