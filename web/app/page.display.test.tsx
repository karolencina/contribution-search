import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import { response, settle } from "../test/helpers";
import Page from "./page";

describe("display", () => {
  let api: FakeFetch;

  beforeEach(() => {
    api = fakeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("shows each start time as a date and a time, in UTC whatever the time zone, without saying UTC", async () => {
    render(<Page />);
    await settle(() =>
      api.respond(
        0,
        response(
          [
            {
              id: 1,
              title: "Late evening",
              owner: "Sarah Jones",
              startTime: "2024-01-10T23:30:00Z",
            },
            {
              id: 2,
              title: "Early morning",
              owner: "Tom Becker",
              startTime: "2024-03-05T09:00:00Z",
            },
            {
              id: 3,
              title: "Just after midnight",
              owner: "Priya Patel",
              startTime: "2024-06-01T00:05:00Z",
            },
          ],
          3,
        ),
      ),
    );

    const [late, early, midnight] = screen
      .getAllByRole("listitem")
      .map((row) => row.querySelector("time"));
    expect(late).toHaveTextContent("10 Jan 2024 23:30");
    expect(late).toHaveAttribute("datetime", "2024-01-10T23:30:00Z");
    expect(early).toHaveTextContent("5 Mar 2024 09:00");
    expect(early).toHaveAttribute("datetime", "2024-03-05T09:00:00Z");
    expect(midnight).toHaveTextContent("1 Jun 2024 00:05");
    expect(screen.queryByText(/UTC/)).toBeNull();
  });

  test("labels the owner and start time on each card, with text only and no icons", async () => {
    render(<Page />);
    await settle(() =>
      api.respond(
        0,
        response(
          [
            {
              id: 1,
              title: "A",
              owner: "B",
              startTime: "2024-01-10T10:30:00Z",
            },
            {
              id: 2,
              title: "C",
              owner: "D",
              startTime: "2024-01-11T11:45:00Z",
            },
          ],
          2,
        ),
      ),
    );

    for (const row of screen.getAllByRole("listitem")) {
      expect(within(row).getByText("Owner")).toBeInTheDocument();
      expect(within(row).getByText("Starts")).toBeInTheDocument();
      expect(row.querySelector("svg")).toBeNull();
    }
  });

  test("draws the page buttons as icons that screen readers skip", async () => {
    render(<Page />);
    await settle(() =>
      api.respond(
        0,
        response(
          [
            {
              id: 1,
              title: "A",
              owner: "B",
              startTime: "2024-01-10T10:30:00Z",
            },
          ],
          23,
        ),
      ),
    );

    for (const name of ["Previous page", "Next page"]) {
      const button = screen.getByRole("button", { name });
      expect(button.textContent).toBe("");
      expect(button.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
  });

  test("puts a search icon in the search box that screen readers skip", () => {
    render(<Page />);

    const searchBox = screen.getByRole("searchbox", {
      name: "Search by title or owner",
    });
    const icon = searchBox.parentElement?.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  test("shows the search prompt inside the search box, not as a label above it", () => {
    render(<Page />);

    const searchBox = screen.getByRole("searchbox", {
      name: "Search by title or owner",
    });

    expect(searchBox).toHaveAttribute(
      "placeholder",
      "Search by title or owner",
    );
    expect(screen.queryByText("Search by title or owner")).toBeNull();
  });

  test("puts the owner's initials in a circle before the name, and skips it when there is no name", async () => {
    const withOwner = (id: number, owner: string) => ({
      id,
      title: `Contribution ${id}`,
      owner,
      startTime: "2024-01-10T10:30:00Z",
    });
    render(<Page />);
    await settle(() =>
      api.respond(
        0,
        response(
          [
            withOwner(1, "Elena Petrova"),
            withOwner(2, "J. Smith"),
            withOwner(3, "Madonna"),
            withOwner(4, "  anna   maria  lopez "),
            withOwner(5, "émile zola"),
            withOwner(6, ""),
          ],
          6,
        ),
      ),
    );

    const circles = screen
      .getAllByRole("listitem")
      .map((row) => row.querySelector('[aria-hidden="true"]'));

    expect(circles.map((circle) => circle?.textContent ?? null)).toEqual([
      "EP",
      "JS",
      "M",
      "AL",
      "ÉZ",
      null,
    ]);
  });

  test("keeps the title, the description and the search box together in one header", () => {
    render(<Page />);

    const header = screen.getByRole("heading", { level: 1 }).closest("header");

    expect(header).not.toBeNull();
    expect(header).toHaveTextContent("Browse the work delivered across teams");
    expect(header).toContainElement(
      screen.getByRole("searchbox", { name: "Search by title or owner" }),
    );
    expect(header).not.toContainElement(screen.getByRole("status"));
  });

  test("describes the page right under the title", () => {
    render(<Page />);

    const title = screen.getByRole("heading", { level: 1 });

    expect(title.nextElementSibling).toHaveTextContent(
      "Browse the work delivered across teams, and search it by title or owner.",
    );
  });
});
