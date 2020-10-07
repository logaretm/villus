import { ClientPlugin, ClientPluginOperation, ObservableLike, OperationResult, QueryVariables } from './types';

export type SubscriptionForwarder<TData = any, TVars = QueryVariables> = (
  operation: ClientPluginOperation
) => ObservableLike<OperationResult<TData>>;

export function handleSubscriptions(forwarder: SubscriptionForwarder): ClientPlugin {
  const forward = forwarder;

  return function subscriptionsHandlerPlugin({ operation, useResult }) {
    if (operation.type !== 'subscription') {
      return;
    }

    if (!forward) {
      throw new Error('No subscription forwarder was set.');
    }

    useResult(forward(operation) as any, true);
  };
}
