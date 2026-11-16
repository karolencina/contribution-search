import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  test("shows the first letter of the first and last word of the name", () => {
    render(<Avatar name="Elena Petrova" />);
    expect(screen.getByText("EP")).toBeInTheDocument();
  });

  test("shows one letter for a name of one word", () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  test("ignores the words between the first and the last", () => {
    render(<Avatar name="Anna Maria Lopez" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  test("shows capital letters, accents included", () => {
    render(<Avatar name="élodie martin" />);
    expect(screen.getByText("ÉM")).toBeInTheDocument();
  });

  test("renders nothing when the name is empty or only spaces", () => {
    const { container, rerender } = render(<Avatar name="" />);
    expect(container).toBeEmptyDOMElement();

    rerender(<Avatar name="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  test("is hidden from screen readers", () => {
    render(<Avatar name="Elena Petrova" />);
    expect(screen.getByText("EP")).toHaveAttribute("aria-hidden", "true");
  });
});
