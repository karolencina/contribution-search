import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import Page from "./page";

const reportingApi = {
  id: 1,
  title: "Reporting API",
  owner: "Sarah Jones",
  startTime: "2024-01-10T10:30:00Z",
};

const euDataExport = {
  id: 5,
  title: "Customer [EU] data export",
  owner: "Tom Becker",
  startTime: "2024-03-05T09:00:00Z",
};

describe("search", () => {
  let api: FakeFetch;

  const type = (text: string) =>
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search by title or owner" }),
      { target: { value: text } },
    );

  const wait = (ms: number) =>
    act(async () => {
      vi.advanceTimersByTime(ms);
    });

  beforeEach(() => {
    vi.useFakeTimers();
    api = fakeFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("waits for a pause in typing, then searches for the typed text from page 1", async () => {
    render(<Page />);

    type("r");
    await wait(200);
    type("re");
    await wait(200);
    expect(api.calls).toHaveLength(1);

    await wait(100);
    expect(api.calls).toHaveLength(2);
    expect(api.calls[1].searchParams.get("q")).toBe("re");
    expect(api.calls[1].searchParams.get("page")).toBe("1");

    await act(async () => {
      api.respond(1, {
        items: [reportingApi],
        total: 1,
        page: 1,
        pageSize: 10,
      });
    });
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Reporting API");
  });

  test.each(["a+b", "R&D", "C#", "100%", "[EU]", ".", " api", "%2B", "50%25"])(
    "sends %j to the API exactly as typed",
    async (text) => {
      render(<Page />);

      type(text);
      await wait(300);

      expect(api.calls).toHaveLength(2);
      expect(api.calls[1].searchParams.get("q")).toBe(text);
    },
  );

  test("clearing the box searches again with no filter, from page 1", async () => {
    render(<Page />);
    type("report");
    await wait(300);
    expect(api.calls).toHaveLength(2);

    type("");
    await wait(300);
    expect(api.calls).toHaveLength(3);
    expect(api.calls[2].searchParams.get("q") ?? "").toBe("");
    expect(api.calls[2].searchParams.get("page")).toBe("1");

    await act(async () => {
      api.respond(2, {
        items: [reportingApi, euDataExport],
        total: 2,
        page: 1,
        pageSize: 10,
      });
    });
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent("Customer [EU] data export");
  });
});
