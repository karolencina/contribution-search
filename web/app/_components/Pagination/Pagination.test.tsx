import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Pagination } from "./Pagination";

const renderPagination = (
  props: Partial<Parameters<typeof Pagination>[0]> = {},
) =>
  render(
    <Pagination
      page={2}
      totalPages={5}
      onPrevious={vi.fn()}
      onNext={vi.fn()}
      {...props}
    />,
  );

describe("Pagination", () => {
  test("is a navigation named Pages", () => {
    renderPagination();

    expect(
      screen.getByRole("navigation", { name: "Pages" }),
    ).toBeInTheDocument();
  });

  test("has Previous page and Next page buttons whose icons screen readers skip", () => {
    renderPagination();

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
    renderPagination({ onPrevious, onNext });

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).not.toHaveBeenCalled();
  });

  test("disables Previous on the first page, and does not call its handler", () => {
    const onPrevious = vi.fn();
    renderPagination({ page: 1, onPrevious });

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  test("disables Next on the last page, and does not call its handler", () => {
    const onNext = vi.fn();
    renderPagination({ page: 5, totalPages: 5, onNext });

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();
  });

  test("shows the current page and the number of pages", () => {
    renderPagination({ page: 2, totalPages: 5 });

    expect(screen.getByText("2 of 5")).toBeInTheDocument();
  });

  test("announces the page politely to screen readers when it changes", () => {
    renderPagination({ page: 2, totalPages: 5 });

    expect(screen.getByText("2 of 5")).toHaveAttribute("aria-live", "polite");
  });
});
