"use client";

import { useEffect, useState } from "react";

import { Avatar } from "./_components/Avatar/Avatar";
import { ChevronIcon, SearchIcon } from "./_components/Icon/Icon";
import { PAGE_SIZE, type Search, useContributions } from "./useContributions";

const DEBOUNCE_MS = 300;
const SLOW_MS = 200;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

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
      <header>
        <h1>Contributions</h1>
        <p className="intro">
          Browse the work delivered across teams, and search it by title or
          owner.
        </p>
        <div className="search-field">
          <SearchIcon />
          <input
            type="search"
            aria-label="Search by title or owner"
            placeholder="Search by title or owner"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
      </header>
      <p role="status">{message}</p>
      {status === "error" && (
        <p role="alert">
          <strong>Error:</strong> Could not load contributions. Try searching
          again.
        </p>
      )}
      {result !== null && result.items.length > 0 && (
        <ul aria-busy={status === "loading"}>
          {result.items.map((item) => {
            const start = new Date(item.startTime);
            return (
              <li key={item.id}>
                <span className="title">{item.title}</span>
                <div className="field">
                  <span className="label">Owner</span>
                  <span className="owner">
                    <Avatar name={item.owner} />
                    {item.owner}
                  </span>
                </div>
                <div className="field">
                  <span className="label">Starts</span>
                  <time dateTime={item.startTime}>
                    <span className="date">{dateFormat.format(start)}</span>{" "}
                    {timeFormat.format(start)}
                  </time>
                </div>
              </li>
            );
          })}
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
            <ChevronIcon direction="left" />
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
            <ChevronIcon direction="right" />
          </button>
        </nav>
      )}
    </main>
  );
}
