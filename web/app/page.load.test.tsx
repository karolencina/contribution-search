import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import Page from "./page";

const pageOneOfThree = {
  items: [
    {
      id: 4,
      title: "Quarterly REPORT automation",
      owner: "Priya Patel",
      startTime: "2024-02-14T14:00:00Z",
    },
    {
      id: 1,
      title: "Reporting API",
      owner: "Sarah Jones",
      startTime: "2024-01-10T10:30:00Z",
    },
    {
      id: 5,
      title: "Customer [EU] data export",
      owner: "Tom Becker",
      startTime: "2024-03-05T09:00:00Z",
    },
  ],
  total: 23,
  page: 1,
  pageSize: 10,
};

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
    pageOneOfThree.items.forEach((item, index) => {
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
