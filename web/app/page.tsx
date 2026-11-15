"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const DEBOUNCE_MS = 300;

type Contribution = {
  id: number;
  title: string;
  owner: string;
  startTime: string;
};

type Result = { items: Contribution[]; total: number };

export default function Page() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    const params = new URLSearchParams({ page: "1", pageSize: "10" });
    if (query !== "") {
      params.set("q", query);
    }
    fetch(`${API_URL}/contributions?${params}`)
      .then((response) => response.json())
      .then(setResult);
  }, [query]);

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
      {result === null ? (
        <p role="status">Loading contributions</p>
      ) : (
        <>
          <p role="status">{result.total} contributions</p>
          <ul>
            {result.items.map((item) => (
              <li key={item.id}>
                {item.title} {item.owner}{" "}
                <time dateTime={item.startTime}>{item.startTime}</time>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
