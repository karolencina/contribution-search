import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Spinner } from "./Spinner";

describe("Spinner", () => {
  test("is hidden from screen readers", () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
