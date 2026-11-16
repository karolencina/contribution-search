import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
export const PAGE_SIZE = 10;

type Result = {
  items: { id: number; title: string; owner: string; startTime: string }[];
  total: number;
};

type Settled = {
  query: string;
  page: number;
  result: Result | null;
  failed: boolean;
};

export function useContributions(query: string, page: number) {
  const [settled, setSettled] = useState<Settled | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;
    const controller = new AbortController();

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
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
          setSettled({ query, page, result, failed: false });
        }
      })
      .catch(() => {
        if (isLatest()) {
          setSettled({ query, page, result: null, failed: true });
        }
      });

    return () => controller.abort();
  }, [query, page]);

  let status: "loading" | "ready" | "error" = "loading";
  if (settled !== null && settled.query === query && settled.page === page) {
    status = settled.failed ? "error" : "ready";
  }
  return { status, result: settled?.result ?? null };
}
