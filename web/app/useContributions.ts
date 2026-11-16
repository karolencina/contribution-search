import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
export const PAGE_SIZE = 10;

export type Contribution = {
  id: number;
  title: string;
  owner: string;
  startTime: string;
};

type Result = { items: Contribution[]; total: number };

export type Search = { query: string; page: number };

type Settled = { search: Search; result: Result | null };

export function useContributions(search: Search) {
  const [settled, setSettled] = useState<Settled | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;

    const params = new URLSearchParams({
      page: String(search.page),
      pageSize: String(PAGE_SIZE),
    });
    if (search.query !== "") {
      params.set("q", search.query);
    }

    fetch(`${API_URL}/contributions?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<Result>;
      })
      .then((result) => {
        if (isLatest()) {
          setSettled({ search, result });
        }
      })
      .catch(() => {
        if (isLatest()) {
          setSettled({ search, result: null });
        }
      });
  }, [search]);

  let status: "loading" | "ready" | "error" = "loading";
  if (settled !== null && settled.search === search) {
    status = settled.result === null ? "error" : "ready";
  }
  return { status, result: settled?.result ?? null };
}
