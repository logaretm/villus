import { GraphQLError } from 'graphql';

// https://github.com/FormidableLabs/urql/blob/master/src/utils/error.ts
const generateErrorMessage = (networkError?: Error, graphqlErrors?: GraphQLError[]) => {
  let error = '';
  if (networkError !== undefined) {
    return (error = `[Network] ${networkError.message}`);
  }

  if (graphqlErrors !== undefined) {
    graphqlErrors.forEach(err => {
      error += `[GraphQL] ${err.message}\n`;
    });
  }

  return error.trim();
};

function normalizeGqlError(error: any): GraphQLError {
  if (typeof error === 'string') {
    return new GraphQLError(error);
  }

  if (typeof error === 'object' && error.message) {
    return new GraphQLError(
      error.message,
      error.nodes,
      error.source,
      error.positions,
      error.path,
      error,
      error.extensions || {},
    );
  }

  return error as any;
}

export class CombinedError extends Error {
  public name: 'CombinedError';
  public message: string;
  public response: any;
  public networkError?: Error;
  public graphqlErrors?: GraphQLError[];

  constructor({
    response,
    networkError,
    graphqlErrors,
  }: {
    response: any;
    networkError?: Error;
    graphqlErrors?: Array<string | GraphQLError | Error>;
  }) {
    const gqlErrors = graphqlErrors?.map(normalizeGqlError);
    const message = generateErrorMessage(networkError, gqlErrors);
    super(message);

    this.name = 'CombinedError';
    this.response = response;
    this.message = message;
    this.networkError = networkError;
    this.graphqlErrors = gqlErrors;
  }

  get isGraphQLError(): boolean {
    return !!(this.graphqlErrors && this.graphqlErrors.length);
  }

  toString() {
    return this.message;
  }
}
