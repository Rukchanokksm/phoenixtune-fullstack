import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeAgo } from "./timeAgo";

const NOW = new Date("2026-05-20T12:00:00Z");

const minutesAgo = (n: number) =>
  new Date(NOW.getTime() - n * 60_000).toISOString();
const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3_600_000).toISOString();
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("EN locale", () => {
    it("returns 'just now' for < 2 minutes ago", () => {
      expect(timeAgo(minutesAgo(0), "en")).toBe("just now");
      expect(timeAgo(minutesAgo(1), "en")).toBe("just now");
    });

    it("returns 'Xm ago' for 2..59 minutes", () => {
      expect(timeAgo(minutesAgo(2), "en")).toBe("2m ago");
      expect(timeAgo(minutesAgo(59), "en")).toBe("59m ago");
    });

    it("returns 'Xh ago' for 1..23 hours", () => {
      expect(timeAgo(hoursAgo(1), "en")).toBe("1h ago");
      expect(timeAgo(hoursAgo(23), "en")).toBe("23h ago");
    });

    it("returns 'Xd ago' for 1..29 days", () => {
      expect(timeAgo(daysAgo(1), "en")).toBe("1d ago");
      expect(timeAgo(daysAgo(29), "en")).toBe("29d ago");
    });

    it("returns absolute date (no 'ago') for >= 30 days", () => {
      const result = timeAgo(daysAgo(30), "en");
      expect(result).not.toMatch(/ago/);
      expect(result).toMatch(/\d{4}/);
    });

    it("defaults to EN locale when no locale arg passed", () => {
      expect(timeAgo(minutesAgo(5))).toBe("5m ago");
    });
  });

  describe("TH locale", () => {
    it("returns 'เมื่อกี้' for < 1 minute ago", () => {
      expect(timeAgo(minutesAgo(0), "th")).toBe("เมื่อกี้");
    });

    it("returns 'X นาทีที่แล้ว' for 1..59 minutes", () => {
      expect(timeAgo(minutesAgo(1), "th")).toBe("1 นาทีที่แล้ว");
      expect(timeAgo(minutesAgo(59), "th")).toBe("59 นาทีที่แล้ว");
    });

    it("returns 'X ชั่วโมงที่แล้ว' for 1..23 hours", () => {
      expect(timeAgo(hoursAgo(1), "th")).toBe("1 ชั่วโมงที่แล้ว");
      expect(timeAgo(hoursAgo(23), "th")).toBe("23 ชั่วโมงที่แล้ว");
    });

    it("returns 'X วันที่แล้ว' for 1..29 days", () => {
      expect(timeAgo(daysAgo(1), "th")).toBe("1 วันที่แล้ว");
      expect(timeAgo(daysAgo(29), "th")).toBe("29 วันที่แล้ว");
    });

    it("returns absolute date with no English month names for >= 30 days", () => {
      const result = timeAgo(daysAgo(30), "th");
      expect(result).not.toMatch(
        /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/,
      );
      expect(result).not.toMatch(/ago/);
    });
  });
});
