import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ContributionList } from "./ContributionList";

const contribution = (
  id: number,
  title: string,
  owner = "Sarah Jones",
  startTime = "2024-01-10T10:30:00Z",
) => ({ id, title, owner, startTime });

describe("ContributionList", () => {
  test("shows one item per contribution, in the order given", () => {
    render(
      <ContributionList
        isLoading={false}
        items={[
          contribution(2, "Second"),
          contribution(1, "First"),
          contribution(3, "Third"),
        ]}
      />,
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Second");
    expect(rows[1]).toHaveTextContent("First");
    expect(rows[2]).toHaveTextContent("Third");
  });

  test("shows the start time as a date and a time in UTC, with the exact time in datetime", () => {
    render(
      <ContributionList
        isLoading={false}
        items={[
          contribution(
            1,
            "Late evening",
            "Sarah Jones",
            "2024-01-10T23:30:00Z",
          ),
        ]}
      />,
    );

    const time = screen.getByRole("listitem").querySelector("time");
    expect(time).toHaveTextContent("10 Jan 2024 23:30");
    expect(time).toHaveAttribute("datetime", "2024-01-10T23:30:00Z");
  });

  test("shows a morning time and a time just after midnight with two-digit hours", () => {
    render(
      <ContributionList
        isLoading={false}
        items={[
          contribution(
            1,
            "Early morning",
            "Tom Becker",
            "2024-03-05T09:00:00Z",
          ),
          contribution(
            2,
            "Just after midnight",
            "Priya Patel",
            "2024-06-01T00:05:00Z",
          ),
        ]}
      />,
    );

    const [early, midnight] = screen
      .getAllByRole("listitem")
      .map((row) => row.querySelector("time"));
    expect(early).toHaveTextContent("5 Mar 2024 09:00");
    expect(early).toHaveAttribute("datetime", "2024-03-05T09:00:00Z");
    expect(midnight).toHaveTextContent("1 Jun 2024 00:05");
  });

  test("puts the owner's initials before the name", () => {
    render(
      <ContributionList
        isLoading={false}
        items={[contribution(1, "Reporting API", "Sarah Jones")]}
      />,
    );

    expect(screen.getByText("SJ").parentElement).toHaveTextContent(
      "SJSarah Jones",
    );
  });

  test("puts the owner under Owner and the start time under Starts", () => {
    render(
      <ContributionList
        isLoading={false}
        items={[
          contribution(
            1,
            "Reporting API",
            "Sarah Jones",
            "2024-01-10T10:30:00Z",
          ),
        ]}
      />,
    );

    expect(screen.getByText("Owner").parentElement).toHaveTextContent(
      "Sarah Jones",
    );
    expect(screen.getByText("Starts").parentElement).toHaveTextContent(
      "10 Jan 2024 10:30",
    );
  });

  test("gives the full title as a tooltip", () => {
    const title =
      "API team capacity planning for the next four quarters: hiring, on-call rotations and infrastructure spend";
    render(
      <ContributionList isLoading={false} items={[contribution(1, title)]} />,
    );

    expect(screen.getByRole("heading", { name: title })).toHaveAttribute(
      "title",
      title,
    );
  });

  test("is marked busy only while it is loading", () => {
    const items = [contribution(1, "Reporting API")];
    const { rerender } = render(<ContributionList isLoading items={items} />);

    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");

    rerender(<ContributionList isLoading={false} items={items} />);

    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "false");
  });
});
