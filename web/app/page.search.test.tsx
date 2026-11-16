import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import {
  euDataExport,
  reportingApi,
  response,
  typeText,
  wait,
} from "../test/helpers";
import Page from "./page";

describe("search", () => {
  let api: FakeFetch;

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

    typeText("r");
    await wait(200);
    typeText("re");
    await wait(200);
    expect(api.calls).toHaveLength(1);

    await wait(100);
    expect(api.calls).toHaveLength(2);
    expect(api.calls[1].searchParams.get("q")).toBe("re");
    expect(api.calls[1].searchParams.get("page")).toBe("1");

    await act(async () => {
      api.respond(1, response([reportingApi], 1));
    });
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Reporting API");
  });

  test.each([
    "a+b",
    "R&D",
    "C#",
    "100%",
    "[EU]",
    ".",
    " api",
    "api ",
    "%2B",
    "50%25",
  ])("sends %j to the API exactly as typed", async (text) => {
    render(<Page />);

    typeText(text);
    await wait(300);

    expect(api.calls).toHaveLength(2);
    expect(api.calls[1].searchParams.get("q")).toBe(text);
  });

  test("clearing the box searches again with no filter, from page 1", async () => {
    render(<Page />);
    typeText("report");
    await wait(300);
    expect(api.calls).toHaveLength(2);

    typeText("");
    await wait(300);
    expect(api.calls).toHaveLength(3);
    expect(api.calls[2].searchParams.get("q") ?? "").toBe("");
    expect(api.calls[2].searchParams.get("page")).toBe("1");

    await act(async () => {
      api.respond(2, response([reportingApi, euDataExport], 2));
    });
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent("Customer [EU] data export");
  });
});
