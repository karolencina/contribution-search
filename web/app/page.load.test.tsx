import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import {
  euDataExport,
  quarterlyReport,
  reportingApi,
  response,
} from "../test/helpers";
import Page from "./page";

const pageOneItems = [quarterlyReport, reportingApi, euDataExport];
const pageOneOfThree = response(pageOneItems, 23);

describe("initial load", () => {
  let api: FakeFetch;

  beforeEach(() => {
    api = fakeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("sends exactly one request on first render, for page 1 with a page size of 10", () => {
    render(<Page />);

    expect(api.calls).toHaveLength(1);
    const request = api.calls[0];
    expect(request.pathname).toBe("/contributions");
    expect(request.searchParams.get("q") ?? "").toBe("");
    expect(request.searchParams.get("page")).toBe("1");
    expect(request.searchParams.get("pageSize")).toBe("10");
  });

  test("announces loading while the first request is pending", () => {
    render(<Page />);

    const announced = screen
      .getAllByRole("status")
      .find((region) => region.textContent?.includes("Loading contributions"));
    expect(announced).toBeDefined();
  });

  test("shows a spinner with the loading text, and removes it when the results arrive", async () => {
    render(<Page />);

    expect(screen.getByRole("status").querySelector("svg")).not.toBeNull();

    await act(async () => {
      api.respond(0, pageOneOfThree);
    });

    expect(screen.getByRole("status").querySelector("svg")).toBeNull();
  });

  test("shows the items in the API's order and the total from the response", async () => {
    render(<Page />);

    await act(async () => {
      api.respond(0, pageOneOfThree);
    });

    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    pageOneItems.forEach((item, index) => {
      expect(rows[index]).toHaveTextContent(item.title);
      expect(rows[index]).toHaveTextContent(item.owner);
      expect(rows[index].querySelector("time")).toHaveAttribute(
        "datetime",
        item.startTime,
      );
    });

    expect(screen.getByText("23 contributions")).toBeInTheDocument();
    expect(screen.queryByText("3 contributions")).not.toBeInTheDocument();
  });

  test("has a search box with an accessible name", () => {
    render(<Page />);

    expect(
      screen.getByRole("searchbox", { name: "Search by title or owner" }),
    ).toBeInTheDocument();
  });
});
