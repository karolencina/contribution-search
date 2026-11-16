import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import {
  clickButton,
  reportingApi,
  response,
  settle,
  typeText,
  wait,
} from "../test/helpers";
import Page from "./page";

describe("edge cases", () => {
  let api: FakeFetch;

  const loadFirstPage = async (total: number) => {
    render(<Page />);
    await settle(() => api.respond(0, response([reportingApi], total)));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    api = fakeFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("disables Next when the total shrinks below the current page", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));
    clickButton("Next page");
    await settle(() => api.respond(2, response([reportingApi], 15, 3)));

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  test("a click in the first 300 ms is not undone by the search timer", async () => {
    await loadFirstPage(23);
    await wait(150);
    clickButton("Next page");
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));
    await wait(200);

    expect(api.calls).toHaveLength(2);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  test("typing back to the current search does not reset the page", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));

    typeText("x");
    await wait(100);
    typeText("");
    await wait(300);

    expect(api.calls).toHaveLength(2);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  test("shows busy again when the search returns to one that already finished", async () => {
    await loadFirstPage(23);
    typeText("ab");
    await wait(300);
    typeText("");
    await wait(300);
    expect(api.calls).toHaveLength(3);

    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
  });

  test("waits 200 ms again before saying loading when a page that was slow comes back", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await wait(200);
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));
    clickButton("Previous page");
    await settle(() => api.respond(2, response([reportingApi], 23, 1)));

    clickButton("Next page");

    expect(screen.getByRole("status")).not.toHaveTextContent("Loading");
  });

  test("says 1 contribution, not 1 contributions", async () => {
    await loadFirstPage(1);

    expect(screen.getByRole("status")).toHaveTextContent(/^1 contribution$/);
  });
});
