---
title: useSubscription()
description: API reference for the useSubscription composable function
order: 3
---

## useSubscription()

The `useSubscription` function allows you to execute GraphQL subscriptions, it requires a `Provider` or `useClient` to be configured in the component tree with a subscription forwarder configured, so make sure to [set that up](/guide/subscriptions) before using `useSubscription`.

The `useSubscription` function returns the following properties and functions:

| Property | Type                                                       | Description                                                                                 |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| data     | `Ref<any/null>`                                            | The GraphQL mutation result's `data`                                                        |
| error    | `Ref<CombinedError>`                                       | Any errors encountered during mutation execution                                            |
| execute  | `({variables: object}) => Promise<OperationResult<TData>>` | Executes the mutation and returns the operation result containing `data` and `error` values |
| isPaused | `Ref<boolean>`                                             | True if the subscription is paused or inactive                                              |
| pause   | `() => void`                                                | Deactivates the subscription temporarily until `resume` is called                          |
| resume   | `() => void`                                               | Activates the subscription                                                                  |

## Usage

The `useSubscription` function is slightly more complex and accepts two arguments, the first being the operation object which contains the following properties:

| Property  | Type                                        | Required | Description                     |
| --------- | ------------------------------------------- | -------- | ------------------------------- |
| query     | `string` or `DocumentNode` or `Ref<string>` | **Yes**  | The subscription to be executed |
| variables | `object` or `Ref<object>`                   | **No**   | The subscription variables      |

The second argument is what is called a `Reducer` which allows you aggregate subscription results. For more information about that, [check the subscription guide](/guide/subscriptions).

Here is a full example of the usage:

```js
function messagesReducer(oldValue, response) {
  oldValue = oldValue || [];
  if (!response.data || response.errors) {
    return oldValue;
  }

  return [...oldValue, response.data.newMessages];
}

const NewMessages = `
  subscription NewMessages {
    newMessages {
      id
      from
      message
    }
  }
`;

const { data } = useSubscription(
  {
    query: NewMessages,
  },
  messagesReducer
);
```

## Reactivity

Subscriptions are fired once and continuously keep emitting results. Because of that, `useSubscription` doesn't accept any reactive queries or variables you may pass.

For more information about subscriptions, you can check [the subscription guide](/guide/subscriptions).
