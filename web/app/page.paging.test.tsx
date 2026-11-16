import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import {
  clickButton,
  euDataExport,
  items,
  quarterlyReport,
  reportingApi,
  response,
  settle,
  typeText,
  wait,
} from "../test/helpers";
import Page from "./page";

describe("paging", () => {
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

  test("Next asks for the next page of the same search and shows it", async () => {
    await loadFirstPage(23);
    typeText("report");
    await wait(300);
    await settle(() => api.respond(1, response([reportingApi], 23)));

    clickButton("Next page");

    expect(api.calls).toHaveLength(3);
    expect(api.calls[2].searchParams.get("q")).toBe("report");
    expect(api.calls[2].searchParams.get("page")).toBe("2");

    await settle(() => api.respond(2, response([quarterlyReport], 23, 2)));
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Quarterly REPORT automation");
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  test("keeps the total and the list on screen while another page loads, and says loading only if it is slow", async () => {
    await loadFirstPage(23);
    const list = screen.getByRole("list");

    clickButton("Next page");

    expect(screen.getByRole("status")).toHaveTextContent("23 contributions");
    expect(screen.getByRole("status")).not.toHaveTextContent("Loading");
    expect(screen.getByRole("list")).toBe(list);

    await wait(200);

    expect(screen.getByRole("status")).toHaveTextContent("23 contributions");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading contributions",
    );
    expect(screen.getByRole("list")).toBe(list);

    await settle(() => api.respond(1, response([quarterlyReport], 23, 2)));

    expect(screen.getByRole("status")).toHaveTextContent("23 contributions");
    expect(screen.getByRole("status")).not.toHaveTextContent("Loading");
    expect(screen.getByRole("list")).toBe(list);
    expect(items()[0]).toHaveTextContent("Quarterly REPORT automation");
  });

  test("shows the spinner with the loading text only if a page is slow", async () => {
    await loadFirstPage(23);

    clickButton("Next page");
    expect(screen.getByRole("status").querySelector("svg")).toBeNull();

    await wait(200);
    expect(screen.getByRole("status").querySelector("svg")).not.toBeNull();

    await settle(() => api.respond(1, response([quarterlyReport], 23, 2)));
    expect(screen.getByRole("status").querySelector("svg")).toBeNull();
  });

  test("disables Previous on the first page and Next on the last", async () => {
    await loadFirstPage(23);

    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    clickButton("Next page");
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));
    clickButton("Next page");
    await settle(() => api.respond(2, response([reportingApi], 23, 3)));

    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  test("groups the page controls in a navigation named Pages", async () => {
    await loadFirstPage(23);

    expect(
      screen.getByRole("navigation", { name: "Pages" }),
    ).toBeInTheDocument();
  });

  test("Previous asks for the page before and shows it", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await settle(() => api.respond(1, response([quarterlyReport], 23, 2)));

    clickButton("Previous page");

    expect(api.calls).toHaveLength(3);
    expect(api.calls[2].searchParams.get("page")).toBe("1");

    await settle(() => api.respond(2, response([reportingApi], 23, 1)));
    expect(items()[0]).toHaveTextContent("Reporting API");
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  test("keeps Previous available when a page past the end comes back empty", async () => {
    await loadFirstPage(23);
    typeText("x");
    await wait(300);
    clickButton("Next page");
    expect(api.calls[2].searchParams.get("q")).toBe("x");
    expect(api.calls[2].searchParams.get("page")).toBe("2");

    await settle(() => api.respond(2, response([], 5, 2)));

    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();

    clickButton("Previous page");
    expect(api.calls[3].searchParams.get("q")).toBe("x");
    expect(api.calls[3].searchParams.get("page")).toBe("1");
  });

  test("keeps Previous available when a later page fails to load", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await settle(() => api.fail(1, 500));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();

    clickButton("Previous page");
    expect(api.calls[2].searchParams.get("page")).toBe("1");
  });

  test("counts a total that fills its pages exactly as that many pages", async () => {
    await loadFirstPage(20);

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  test("hides the page controls when everything fits on one page", async () => {
    await loadFirstPage(10);

    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Previous page" }),
    ).not.toBeInTheDocument();
  });

  test("a new search goes back to page 1 and never pairs the new text with the old page", async () => {
    await loadFirstPage(23);
    clickButton("Next page");
    await settle(() => api.respond(1, response([reportingApi], 23, 2)));
    clickButton("Next page");
    await settle(() => api.respond(2, response([reportingApi], 23, 3)));
    expect(screen.getByText("3 of 3")).toBeInTheDocument();

    typeText("x");
    await wait(300);

    const withNewText = api.calls.filter(
      (call) => call.searchParams.get("q") === "x",
    );
    expect(withNewText).toHaveLength(1);
    expect(withNewText[0].searchParams.get("page")).toBe("1");
  });

  test("keeps the newest page when two page requests finish out of order", async () => {
    await loadFirstPage(23);

    clickButton("Next page");
    clickButton("Next page");
    expect(api.calls[1].searchParams.get("page")).toBe("2");
    expect(api.calls[2].searchParams.get("page")).toBe("3");

    await settle(() => api.respond(2, response([euDataExport], 23, 3)));
    await settle(() => api.respond(1, response([quarterlyReport], 23, 2)));

    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Customer [EU] data export");
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
  });

  test("says so when there are no contributions", async () => {
    render(<Page />);
    await settle(() => api.respond(0, response([], 0)));

    expect(screen.getByRole("status")).toHaveTextContent(
      "No contributions found",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();
  });

  test("names the search when nothing matches it", async () => {
    render(<Page />);
    await settle(() => api.respond(0, response([reportingApi], 23)));
    typeText("xyz");
    await wait(300);
    await settle(() => api.respond(1, response([], 0)));

    expect(screen.getByRole("status")).toHaveTextContent(
      'No contributions match "xyz"',
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
