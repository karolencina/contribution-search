"use client";

import { useEffect, useState } from "react";

import { PAGE_SIZE, useContributions } from "./useContributions";

const DEBOUNCE_MS = 300;
const SLOW_MS = 200;

export default function Page() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { status, result } = useContributions(query, page);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(text);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const requestKey = JSON.stringify([query, page]);
  const [slowRequest, setSlowRequest] = useState("");

  useEffect(() => {
    if (status !== "loading") {
      return undefined;
    }
    const timer = setTimeout(() => setSlowRequest(requestKey), SLOW_MS);
    return () => clearTimeout(timer);
  }, [status, requestKey]);

  const total = result === null ? 0 : result.total;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  let message = "";
  if (status === "loading" && (total === 0 || slowRequest === requestKey)) {
    message =
      total > 0
        ? `${total} contributions. Loading contributions`
        : "Loading contributions";
  } else if (result !== null && total === 0) {
    message =
      query === ""
        ? "No contributions found"
        : `No contributions match "${query}"`;
  } else if (result !== null) {
    message = `${total} contributions`;
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
            disabled={page === 1}
            aria-label="Previous page"
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>
            {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            aria-label="Next page"
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
