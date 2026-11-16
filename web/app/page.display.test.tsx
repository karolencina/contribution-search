import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch } from "../test/fakeFetch";
import Page from "./page";

describe("display", () => {
  beforeEach(() => {
    fakeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("keeps the title, the description and the search box together in one header", () => {
    render(<Page />);

    const header = screen.getByRole("heading", { level: 1 }).closest("header");

    expect(header).not.toBeNull();
    expect(header).toHaveTextContent("Browse the work delivered across teams");
    expect(header).toContainElement(
      screen.getByRole("searchbox", { name: "Search by title or owner" }),
    );
  });

  test("describes the page right under the title", () => {
    render(<Page />);

    const title = screen.getByRole("heading", { level: 1 });

    expect(title.nextElementSibling).toHaveTextContent(
      "Browse the work delivered across teams, and search it by title or owner.",
    );
  });
});
