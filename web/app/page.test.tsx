import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Page from "./page";

test("the home page has a heading", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Contribution Search" }),
  ).toBeInTheDocument();
});
