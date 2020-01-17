import { GraphQLResponse } from '../types';

interface ParsedResponse<TData> {
  ok: boolean;
  status: number;
  statusText: string;
  body: GraphQLResponse<TData> | null;
}

export async function parseResponse<TData>(response: Response): Promise<ParsedResponse<TData>> {
  let json: GraphQLResponse<TData>;
  const responseData = {
    ok: response.ok,
    statusText: response.statusText,
    status: response.status
  };

  try {
    json = await response.json();
  } catch (err) {
    return {
      ...responseData,
      statusText: err.message,
      body: null
    };
  }

  return {
    ...responseData,
    body: json
  };
}
