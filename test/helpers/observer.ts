export function makeObservable(throws = false) {
  let interval: any;
  let counter = 0;
  const observable = {
    subscribe: function({ next, error }: { error: Function; next: Function }) {
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
        }
      };
    }
  };

  return observable;
}
