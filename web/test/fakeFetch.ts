import { vi } from "vitest";

export type FakeFetch = {
  calls: URL[];
  respond: (index: number, body: unknown) => void;
};

export function fakeFetch(): FakeFetch {
  const calls: URL[] = [];
  const resolvers: Array<(response: Response) => void> = [];

  vi.stubGlobal("fetch", (input: RequestInfo | URL) => {
    calls.push(new URL(String(input), "http://localhost"));
    return new Promise<Response>((resolve) => {
      resolvers.push(resolve);
    });
  });

  return {
    calls,
    respond: (index, body) =>
      resolvers[index](new Response(JSON.stringify(body))),
  };
}
