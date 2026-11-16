"use client";

import { type ReactNode, useEffect, useState } from "react";

import { ContributionList } from "./_components/ContributionList/ContributionList";
import { ChevronIcon } from "./_components/Icon/Icon";
import { SearchField } from "./_components/SearchField/SearchField";
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

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "";
  }
  const firstAndLast =
    words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return firstAndLast.map((word) => Array.from(word)[0].toUpperCase()).join("");
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <Icon>
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </Icon>
  );
}

function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </Icon>
  );
}

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
        <SearchField
          label="Search by title or owner"
          value={text}
          onChange={setText}
        />
      </header>
      <p role="status">{message}</p>
      {status === "error" && (
        <p role="alert">
          <strong>Error:</strong> Could not load contributions. Try searching
          again.
        </p>
      )}
      {result !== null && result.items.length > 0 && (
        <ContributionList
          items={result.items}
          isLoading={status === "loading"}
        />
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
