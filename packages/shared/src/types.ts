import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode } from 'graphql';

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
  query: string | DocumentNode | TypedDocumentNode<TData, TVars>;
  variables?: TVars;
}
