import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { fakeFetch } from "../test/fakeFetch";
import Page from "./page";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("the home page has a heading", () => {
  fakeFetch();
  render(<Page />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Contribution Search" }),
  ).toBeInTheDocument();
});
