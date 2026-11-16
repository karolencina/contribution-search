import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  test("is a navigation named by the label it is given", () => {
    render(<Pagination.Root aria-label="Pages" />);

    expect(
      screen.getByRole("navigation", { name: "Pages" }),
    ).toBeInTheDocument();
  });

  test("has Previous page and Next page buttons whose icons screen readers skip", () => {
    render(
      <Pagination.Root aria-label="Pages">
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Root>,
    );

    for (const name of ["Previous page", "Next page"]) {
      const button = screen.getByRole("button", { name });
      expect(button.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
  });

  test("calls the handler of the button that is clicked, and only that one", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <Pagination.Root aria-label="Pages">
        <Pagination.Previous onClick={onPrevious} />
        <Pagination.Next onClick={onNext} />
      </Pagination.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).not.toHaveBeenCalled();
  });

  test("does not call the handler of a disabled button", () => {
    const onNext = vi.fn();
    render(<Pagination.Next disabled onClick={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();
  });

  test("shows the status text it is given", () => {
    render(<Pagination.Status>2 of 5</Pagination.Status>);

    expect(screen.getByText("2 of 5")).toBeInTheDocument();
  });

  test("announces its text politely to screen readers when it changes", () => {
    render(<Pagination.Status>2 of 5</Pagination.Status>);

    expect(screen.getByText("2 of 5")).toHaveAttribute("aria-live", "polite");
  });
});
