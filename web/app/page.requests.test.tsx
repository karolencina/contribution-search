import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fakeFetch, type FakeFetch } from "../test/fakeFetch";
import {
  euDataExport,
  items,
  quarterlyReport,
  reportingApi,
  response,
  settle,
  typeText,
  wait,
} from "../test/helpers";
import Page from "./page";

describe("requests", () => {
  let api: FakeFetch;

  const searchTwice = async () => {
    render(<Page />);
    typeText("alpha");
    await wait(300);
    typeText("beta");
    await wait(300);
    expect(api.calls).toHaveLength(3);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    api = fakeFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("ignores older responses that arrive after the newest one", async () => {
    await searchTwice();

    await settle(() => api.respond(2, response([quarterlyReport], 1)));
    await settle(() => api.respond(1, response([reportingApi], 1)));
    await settle(() => api.respond(0, response([euDataExport], 1)));

    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Quarterly REPORT automation");
  });

  test("keeps the unfiltered results when a cleared search's older request arrives late", async () => {
    render(<Page />);
    typeText("report");
    await wait(300);
    typeText("");
    await wait(300);
    expect(api.calls).toHaveLength(3);

    await settle(() =>
      api.respond(2, response([reportingApi, euDataExport], 2)),
    );
    await settle(() => api.respond(1, response([reportingApi], 1)));

    expect(items()).toHaveLength(2);
  });

  test("an older request failing late does not replace the newest results with an error", async () => {
    await searchTwice();

    await settle(() => api.respond(2, response([quarterlyReport], 1)));
    await settle(() => api.fail(1, 500));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Quarterly REPORT automation");
  });

  test("an older response arriving after the newest one failed does not hide the error", async () => {
    await searchTwice();

    await settle(() => api.fail(2, 500));
    await settle(() => api.respond(1, response([reportingApi], 1)));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("keeps showing loading when an older request finishes while the newest is pending", async () => {
    await searchTwice();

    await settle(() => api.respond(1, response([reportingApi], 1)));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading contributions",
    );

    await settle(() =>
      api.respond(2, response([quarterlyReport, euDataExport], 2)),
    );
    expect(screen.getByRole("status")).toHaveTextContent("2 contributions");
  });

  test.each([
    ["an HTTP 500", (fake: FakeFetch) => fake.fail(1, 500)],
    ["a network error", (fake: FakeFetch) => fake.networkError(1)],
    [
      "a 200 response with an unexpected body",
      (fake: FakeFetch) => fake.respond(1, {}),
    ],
  ])(
    "shows an error and hides the old results after %s",
    async (_name, breakRequest) => {
      render(<Page />);
      await settle(() => api.respond(0, response([reportingApi], 1)));
      typeText("a");
      await wait(300);

      await settle(() => breakRequest(api));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    },
  );

  test("a successful search after an error clears the error", async () => {
    render(<Page />);
    await settle(() => api.fail(0, 500));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    typeText("a");
    await wait(300);
    await settle(() => api.respond(1, response([reportingApi], 1)));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(items()).toHaveLength(1);
  });

  test("keeps the old results, marked busy, while a later search loads", async () => {
    render(<Page />);
    await settle(() => api.respond(0, response([reportingApi], 23)));

    typeText("a");
    await wait(300);

    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    expect(items()).toHaveLength(1);

    await wait(200);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading contributions",
    );

    await settle(() =>
      api.respond(1, response([quarterlyReport, euDataExport], 2)),
    );

    expect(screen.getByRole("status")).toHaveTextContent("2 contributions");
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-busy", "true");
  });
});
