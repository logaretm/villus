export function makeObservable(throws = false) {
  let interval: any;
  let counter = 0;
  const observable = {
    subscribe({ next, error }: { error: (err: Error) => any; next: (value: any) => any }) {
      interval = setInterval(() => {
        if (throws) {
          error(new Error('oops!'));
          return;
        }

        next({ data: { message: 'New message', id: counter++ } });
      }, 100);

      afterAll(() => {
        clearTimeout(interval);
      });

      return {
        unsubscribe() {
          clearTimeout(interval);
        },
      };
    },
  };

  return observable;
}

export function tick(ticks = 1) {
  jest.advanceTimersByTime(ticks * 100 + 1);
}
