import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ContributionCard } from "./ContributionCard";

const item = {
  id: 1,
  title: "Billing overhaul",
  owner: "Sarah Jones",
  startTime: "2024-01-10T10:30:00Z",
};

const renderCard = () =>
  render(
    <ul>
      <ContributionCard item={item} />
    </ul>,
  );

describe("ContributionCard", () => {
  test("is a list item", () => {
    renderCard();

    expect(screen.getByRole("listitem")).toHaveTextContent("Billing overhaul");
  });

  test("shows the title as a second-level heading", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Billing overhaul", level: 2 }),
    ).toBeInTheDocument();
  });

  test("shows each field's label right before its value", () => {
    renderCard();

    expect(screen.getByText("Owner").nextElementSibling).toHaveTextContent(
      "Sarah Jones",
    );
    expect(screen.getByText("Starts").nextElementSibling).toHaveAttribute(
      "datetime",
      "2024-01-10T10:30:00Z",
    );
  });
});
