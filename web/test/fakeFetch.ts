import { vi } from "vitest";

export type FakeFetch = {
  calls: URL[];
  respond: (index: number, body: unknown) => void;
  fail: (index: number, status: number) => void;
  networkError: (index: number) => void;
};

type Pending = {
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
};

export function fakeFetch(): FakeFetch {
  const calls: URL[] = [];
  const pending: Pending[] = [];

  vi.stubGlobal("fetch", (input: RequestInfo | URL) => {
    calls.push(new URL(String(input), "http://localhost"));
    return new Promise<Response>((resolve, reject) => {
      pending.push({ resolve, reject });
    });
  });

  return {
    calls,
    respond: (index, body) =>
      pending[index].resolve(new Response(JSON.stringify(body))),
    fail: (index, status) =>
      pending[index].resolve(new Response("{}", { status })),
    networkError: (index) =>
      pending[index].reject(new TypeError("Failed to fetch")),
  };
}
