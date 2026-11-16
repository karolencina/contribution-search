import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import { response, settle } from "../test/helpers";
import Page from "./page";

describe("display", () => {
  let api: FakeFetch;

  beforeEach(() => {
    api = fakeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("shows each start time as a readable date in UTC, whatever the time zone", async () => {
    render(<Page />);
    await settle(() =>
      api.respond(
        0,
        response(
          [
            {
              id: 1,
              title: "Late evening",
              owner: "Sarah Jones",
              startTime: "2024-01-10T23:30:00Z",
            },
            {
              id: 2,
              title: "Early morning",
              owner: "Tom Becker",
              startTime: "2024-03-05T09:00:00Z",
            },
          ],
          2,
        ),
      ),
    );

    const [late, early] = screen
      .getAllByRole("listitem")
      .map((row) => row.querySelector("time"));
    expect(late).toHaveTextContent("10 Jan 2024, 23:30 UTC");
    expect(late).toHaveAttribute("datetime", "2024-01-10T23:30:00Z");
    expect(early).toHaveTextContent("5 Mar 2024, 09:00 UTC");
    expect(early).toHaveAttribute("datetime", "2024-03-05T09:00:00Z");
  });
});
