import { DocumentNode } from 'graphql';

export interface DocumentDecoration<
  Result = {
    [key: string]: any;
  },
  Variables = {
    [key: string]: any;
  },
> {
  /** Type to support `@graphql-typed-document-node/core`
   * @internal
   */
  __apiType?: (variables: Variables) => Result;
  /** Type to support `TypedQueryDocumentNode` from `graphql`
   * @internal
   */
  __ensureTypesOfVariablesAndResultMatching?: (variables: Variables) => Result;
}

export interface GraphQLResponse<TData> {
  data: TData;
  errors: any;
}

export interface FetchOptions extends RequestInit {
  url?: string;
  headers: NonNullable<Record<string, string>>;
}

export interface ParsedResponse<TData> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: GraphQLResponse<TData> | null;
}

export interface Operation<TData, TVars> {
  query: string | DocumentNode | DocumentDecoration<TData, TVars>;
  variables?: TVars;
}

export type QueryVariables = Record<string, any>;
