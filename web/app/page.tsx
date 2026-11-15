"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Contribution = {
  id: number;
  title: string;
  owner: string;
  startTime: string;
};

type Result = { items: Contribution[]; total: number };

export default function Page() {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/contributions?page=1&pageSize=10`)
      .then((response) => response.json())
      .then(setResult);
  }, []);

  return (
    <main>
      <h1>Contribution Search</h1>
      <label>
        Search by title or owner
        <input type="search" />
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
