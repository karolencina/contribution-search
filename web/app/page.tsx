"use client";

import { useEffect, useState } from "react";

import { ContributionList } from "./_components/ContributionList/ContributionList";
import { Pagination } from "./_components/Pagination/Pagination";
import { SearchField } from "./_components/SearchField/SearchField";
import { Spinner } from "./_components/Spinner/Spinner";
import styles from "./page.module.css";
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

  const showLoading =
    status === "loading" && (total === 0 || slowSearch === search);

  let message = "";
  if (showLoading) {
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
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contributions</h1>
        <p className={styles.intro}>
          Browse the work delivered across teams, and search it by title or
          owner.
        </p>
        <SearchField
          label="Search by title or owner"
          value={text}
          onChange={setText}
        />
      </header>
      <p role="status" className={styles.status}>
        {showLoading && <Spinner />}
        {message}
      </p>
      {status === "error" && (
        <p role="alert" className={styles.alert}>
          <strong>Error:</strong> Could not load contributions. Change the
          search to try again.
        </p>
      )}
      {result !== null && result.items.length > 0 && (
        <ContributionList
          items={result.items}
          isLoading={status === "loading"}
        />
      )}
      {(totalPages > 1 || search.page > 1) && (
        <Pagination
          page={search.page}
          totalPages={totalPages}
          onPrevious={() =>
            setSearch((current) => ({ ...current, page: current.page - 1 }))
          }
          onNext={() =>
            setSearch((current) => ({ ...current, page: current.page + 1 }))
          }
        />
      )}
    </main>
  );
}
