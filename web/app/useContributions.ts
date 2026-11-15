import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Result = {
  items: { id: number; title: string; owner: string; startTime: string }[];
  total: number;
};

type Settled = { query: string; result: Result | null; failed: boolean };

export function useContributions(query: string) {
  const [settled, setSettled] = useState<Settled | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;
    const controller = new AbortController();

    const params = new URLSearchParams({ page: "1", pageSize: "10" });
    if (query !== "") {
      params.set("q", query);
    }

    fetch(`${API_URL}/contributions?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`The API answered ${response.status}`);
        }
        return response.json() as Promise<Result>;
      })
      .then((result) => {
        if (isLatest()) {
          setSettled({ query, result, failed: false });
        }
      })
      .catch(() => {
        if (isLatest()) {
          setSettled({ query, result: null, failed: true });
        }
      });

    return () => controller.abort();
  }, [query]);

  let status: "loading" | "ready" | "error" = "loading";
  if (settled !== null && settled.query === query) {
    status = settled.failed ? "error" : "ready";
  }
  return { status, result: settled?.result ?? null };
}
