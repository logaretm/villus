import { normalizeQuery } from '../../shared/src/utils';
import { ClientPlugin, ClientPluginOperation, ObservableLike, StandardOperationResult, MaybePromise } from './types';

export type SubscriptionForwarder<TData = any> = (
  operation: Omit<ClientPluginOperation, 'query'> & { query: string },
) => MaybePromise<ObservableLike<StandardOperationResult<TData>>>;

export function handleSubscriptions(forwarder: SubscriptionForwarder): ClientPlugin {
  const forward = forwarder;

  return async function subscriptionsHandlerPlugin({ operation, useResult }) {
    if (operation.type !== 'subscription') {
      return;
    }

    if (!forward) {
      throw new Error('No subscription forwarder was set.');
    }

    const normalizedQuery = normalizeQuery(operation.query);
    if (!normalizedQuery) {
      throw new Error('A query must be provided.');
    }

    const result = await forward({ ...operation, query: normalizedQuery });

    useResult(result as any, true);
  };
}
