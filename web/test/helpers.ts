import { act, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";

export const reportingApi = {
  id: 1,
  title: "Reporting API",
  owner: "Sarah Jones",
  startTime: "2024-01-10T10:30:00Z",
};

export const quarterlyReport = {
  id: 4,
  title: "Quarterly REPORT automation",
  owner: "Priya Patel",
  startTime: "2024-02-14T14:00:00Z",
};

export const euDataExport = {
  id: 5,
  title: "Customer [EU] data export",
  owner: "Tom Becker",
  startTime: "2024-03-05T09:00:00Z",
};

export const response = (items: unknown[], total: number, page = 1) => ({
  items,
  total,
  page,
  pageSize: 10,
});

export const typeText = (text: string) =>
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search by title or owner" }),
    { target: { value: text } },
  );

export const clickButton = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

export const wait = (ms: number) =>
  act(async () => {
    vi.advanceTimersByTime(ms);
  });

export const settle = (action: () => void) =>
  act(async () => {
    action();
  });

export const items = () => screen.queryAllByRole("listitem");
