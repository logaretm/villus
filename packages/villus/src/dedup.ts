import { ClientPlugin, OperationResult } from './types';

export function dedup(): ClientPlugin {
  // Holds references to pending operations
  const pendingLookup: Partial<Record<number, Promise<OperationResult>>> = {};

  return function dedupPlugin(ctx) {
    // Don't dedup mutations or subscriptions
    if (ctx.operation.type !== 'query') {
      return;
    }

    // extract the original useResult function
    const { useResult } = ctx;

    // Clean up pending queries after they are resolved
    ctx.afterQuery(() => {
      delete pendingLookup[ctx.operation.key];
    });

    // If pending, re-route the result to it
    const existingOp = pendingLookup[ctx.operation.key];
    if (existingOp) {
      return existingOp.then(result => {
        useResult(result, true);
      });
    }

    // Hold a resolve fn reference
    let resolveOp: (value: OperationResult) => void;

    // Create a pending operation promise and add it to lookup
    pendingLookup[ctx.operation.key] = new Promise<any>(resolve => {
      resolveOp = resolve;
    });

    // resolve the promise once the result are set via another plugin
    ctx.useResult = function (...args: [any, any]) {
      useResult(...args);
      resolveOp(args[0]);
    };
  };
}
