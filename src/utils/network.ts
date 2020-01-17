import { GraphQLResponse } from '../types';

interface ParsedResponse<TData> {
  ok: boolean;
  status: number;
  statusText: string;
  body: GraphQLResponse<TData> | null;
}

export async function parseResponse<TData>(response: Response): Promise<ParsedResponse<TData>> {
  let json: GraphQLResponse<TData>;
  try {
    json = await response.json();
  } catch {
    return response as ParsedResponse<TData>;
  }

  return {
    ok: response.ok,
    statusText: response.statusText,
    status: response.status,
    body: json
  };
}
