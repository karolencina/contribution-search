import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { SearchField } from "./SearchField";

describe("SearchField", () => {
  test("is a search landmark around the search box", () => {
    render(<SearchField label="Find a thing" value="" onChange={vi.fn()} />);

    expect(
      within(screen.getByRole("search")).getByRole("searchbox", {
        name: "Find a thing",
      }),
    ).toBeInTheDocument();
  });

  test("names the search box with its label", () => {
    render(<SearchField label="Find a thing" value="" onChange={vi.fn()} />);

    expect(
      screen.getByRole("searchbox", { name: "Find a thing" }),
    ).toBeInTheDocument();
  });

  test("shows the label as the placeholder", () => {
    render(<SearchField label="Find a thing" value="" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "placeholder",
      "Find a thing",
    );
  });

  test("passes the typed text on exactly as typed", () => {
    const onChange = vi.fn();
    render(<SearchField label="Find a thing" value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "a+b & 50% #1 " },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("a+b & 50% #1 ");
  });

  test("has a search icon that screen readers skip", () => {
    render(<SearchField label="Find a thing" value="" onChange={vi.fn()} />);

    const icon = screen
      .getByRole("searchbox")
      .parentElement?.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  test("shows no clear button while the box is empty", () => {
    render(<SearchField label="Find a thing" value="" onChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  test("shows a clear button, with an icon that screen readers skip, once there is text", () => {
    render(<SearchField label="Find a thing" value="abc" onChange={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Clear search" });

    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("clears the text and puts the cursor back in the box when the clear button is pressed", () => {
    const onChange = vi.fn();
    render(
      <SearchField label="Find a thing" value="abc" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});
