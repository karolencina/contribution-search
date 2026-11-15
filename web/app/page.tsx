"use client";

import { useEffect, useState } from "react";

import { useContributions } from "./useContributions";

const DEBOUNCE_MS = 300;

export default function Page() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const { status, result } = useContributions(query);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  let message = "";
  if (status === "loading") {
    message = "Loading contributions";
  } else if (result !== null) {
    message = `${result.total} contributions`;
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
      {result !== null && (
        <ul aria-busy={status === "loading"}>
          {result.items.map((item) => (
            <li key={item.id}>
              {item.title} {item.owner}{" "}
              <time dateTime={item.startTime}>{item.startTime}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
