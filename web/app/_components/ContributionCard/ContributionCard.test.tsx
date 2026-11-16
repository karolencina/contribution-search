import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ContributionCard } from "./ContributionCard";

describe("ContributionCard", () => {
  test("is a list item", () => {
    render(
      <ul>
        <ContributionCard.Root>Billing overhaul</ContributionCard.Root>
      </ul>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("Billing overhaul");
  });

  test("shows the title as a second-level heading", () => {
    render(<ContributionCard.Title>Billing overhaul</ContributionCard.Title>);

    expect(
      screen.getByRole("heading", { name: "Billing overhaul", level: 2 }),
    ).toBeInTheDocument();
  });

  test("shows a field's label right before its value", () => {
    render(
      <ContributionCard.Field label="Owner">
        <span>Sarah Jones</span>
      </ContributionCard.Field>,
    );

    expect(screen.getByText("Owner").nextElementSibling).toBe(
      screen.getByText("Sarah Jones"),
    );
  });
});
