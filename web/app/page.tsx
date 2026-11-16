"use client";

import { useEffect, useState } from "react";

import { PAGE_SIZE, type Search, useContributions } from "./useContributions";

const DEBOUNCE_MS = 300;
const SLOW_MS = 200;

export default function Page() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState<Search>({ query: "", page: 1 });
  const { status, result } = useContributions(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch((current) =>
        current.query === text ? current : { query: text, page: 1 },
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const [slowSearch, setSlowSearch] = useState<Search | null>(null);

  useEffect(() => {
    if (status !== "loading") {
      return undefined;
    }
    const timer = setTimeout(() => setSlowSearch(search), SLOW_MS);
    return () => clearTimeout(timer);
  }, [status, search]);

  const total = result === null ? 0 : result.total;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const count = `${total} ${total === 1 ? "contribution" : "contributions"}`;

  let message = "";
  if (status === "loading" && (total === 0 || slowSearch === search)) {
    message =
      total > 0 ? `${count}. Loading contributions` : "Loading contributions";
  } else if (result !== null && total === 0) {
    message =
      search.query === ""
        ? "No contributions found"
        : `No contributions match "${search.query}"`;
  } else if (result !== null) {
    message = count;
  }

  return (
    <main>
      <h1>Contribution Search</h1>
      <label>
        Search by title or owner
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <p role="status">{message}</p>
      {status === "error" && (
        <p role="alert">Could not load contributions. Try searching again.</p>
      )}
      {result !== null && result.items.length > 0 && (
        <ul aria-busy={status === "loading"}>
          {result.items.map((item) => (
            <li key={item.id}>
              {item.title} {item.owner}{" "}
              <time dateTime={item.startTime}>{item.startTime}</time>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <nav aria-label="Pages">
          <button
            type="button"
            disabled={search.page === 1}
            aria-label="Previous page"
            onClick={() =>
              setSearch((current) => ({ ...current, page: current.page - 1 }))
            }
          >
            Previous
          </button>
          <span>
            {search.page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={search.page >= totalPages}
            aria-label="Next page"
            onClick={() =>
              setSearch((current) => ({ ...current, page: current.page + 1 }))
            }
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
