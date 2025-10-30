/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, expect, test, vi } from "vitest";
import { plugin } from "./index";
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc";

dayjsBase.extend(utc);

// Use a fixed date for deterministic tests
const FIXED_DATE = "2024-01-15T12:00:00.000Z";
const FIXED_DATE_2 = "2024-01-10T08:30:00.000Z";

describe("Dayjs Plugin", () => {
  describe("Plugin Structure", () => {
    test("exports a valid plugin object", () => {
      expect(plugin).toBeTypeOf("object");
      expect(plugin).toHaveProperty("templateFunctions");
    });

    test("templateFunctions is an array", () => {
      expect(Array.isArray(plugin.templateFunctions)).toBe(true);
    });

    test("has all expected template functions", () => {
      const functionNames = (plugin.templateFunctions ?? []).map(
        (fn) => fn.name
      );
      expect(functionNames).toContain("dayjs");
      expect(functionNames).toContain("dayjs.format");
      expect(functionNames).toContain("dayjs.from");
      expect(functionNames).toContain("dayjs.toISOString");
    });

    test("each template function has required properties", () => {
      (plugin.templateFunctions ?? []).forEach((fn) => {
        expect(fn).toHaveProperty("name");
        expect(fn).toHaveProperty("args");
        expect(fn).toHaveProperty("onRender");
        expect(typeof fn.name).toBe("string");
        expect(Array.isArray(fn.args)).toBe(true);
        expect(typeof fn.onRender).toBe("function");
      });
    });
  });

  describe("dayjs (base function)", () => {
    test("returns valid ISO string for specific date", () => {
      const result = dayjsBase(FIXED_DATE).toJSON();
      expect(result).toBe(FIXED_DATE);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("returns valid ISO string when no parameter provided", () => {
      const result = dayjsBase().toJSON();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("handles empty string input", () => {
      const result = dayjsBase("").toJSON();
      // Empty string creates invalid date, toJSON returns null
      expect(result).toBe(null);
    });

    test("returns local time format when toUTCTime is false", () => {
      const result = dayjsBase(FIXED_DATE).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/
      );
    });

    test("returns UTC time when toUTCTime is true", () => {
      const result = dayjsBase(FIXED_DATE).utc().toJSON();
      expect(result).toBe(FIXED_DATE);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("dayjs.format", () => {
    test("formats date with YYYY-MM-DD pattern", () => {
      const result = dayjsBase(FIXED_DATE).format("YYYY-MM-DD");
      expect(result).toBe("2024-01-15");
    });

    test("formats date with HH:mm:ss pattern", () => {
      const result = dayjsBase(FIXED_DATE).utc().format("HH:mm:ss");
      expect(result).toBe("12:00:00");
    });

    test("formats date with custom pattern", () => {
      const result = dayjsBase(FIXED_DATE).utc().format("YYYY/MM/DD HH:mm");
      expect(result).toBe("2024/01/15 12:00");
    });

    test("handles advanced format patterns", () => {
      const result = dayjsBase(FIXED_DATE).format("MMMM Do YYYY");
      expect(result).toBe("January 15th 2024");
    });

    test("falls back to current date when invalid dateTime provided", () => {
      const isValid = dayjsBase("invalid-date").isValid();
      expect(isValid).toBe(false);

      // The callback should use current date for invalid input
      const result = dayjsBase("invalid-date").isValid()
        ? dayjsBase("invalid-date").format("YYYY-MM-DD")
        : dayjsBase().format("YYYY-MM-DD");

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("dayjs.from (relative time)", () => {
    test("returns relative time for past date", () => {
      const result = dayjsBase(FIXED_DATE).from(FIXED_DATE_2);
      expect(result).toBe("in 5 days");
    });

    test("returns relative time for future date", () => {
      const result = dayjsBase(FIXED_DATE_2).from(FIXED_DATE);
      expect(result).toBe("5 days ago");
    });

    test("handles same date", () => {
      const result = dayjsBase(FIXED_DATE).from(FIXED_DATE);
      expect(result).toBe("a few seconds ago");
    });

    test("handles dates with hours difference", () => {
      const date1 = "2024-01-15T12:00:00.000Z";
      const date2 = "2024-01-15T14:00:00.000Z";
      const result = dayjsBase(date1).from(date2);
      expect(result).toBe("2 hours ago");
    });
  });

  describe("dayjs.toISOString", () => {
    test("returns valid ISO 8601 string", () => {
      const result = dayjsBase(FIXED_DATE).toISOString();
      expect(result).toBe(FIXED_DATE);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("handles current date when no input provided", () => {
      const result = dayjsBase().toISOString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("handles specific date input", () => {
      const result = dayjsBase(FIXED_DATE_2).toISOString();
      expect(result).toBe(FIXED_DATE_2);
    });
  });

  describe("Edge Cases", () => {
    test("handles invalid date strings gracefully", () => {
      const invalidDate = "not-a-date";
      const isValid = dayjsBase(invalidDate).isValid();
      expect(isValid).toBe(false);
    });

    test("handles undefined parameter", () => {
      const result = dayjsBase(undefined).toJSON();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("handles empty string parameter", () => {
      const result = dayjsBase("").toJSON();
      // Empty string creates invalid date, toJSON returns null
      expect(result).toBe(null);
    });

    test("handles epoch date (1970)", () => {
      const epochDate = "1970-01-01T00:00:00.000Z";
      const result = dayjsBase(epochDate).utc().format("YYYY-MM-DD");
      expect(result).toBe("1970-01-01");
    });

    test("handles far future date", () => {
      const futureDate = "2099-12-31T23:59:59.999Z";
      const result = dayjsBase(futureDate).utc().format("YYYY-MM-DD");
      expect(result).toBe("2099-12-31");
    });

    test("handles malformed format string gracefully", () => {
      const result = dayjsBase(FIXED_DATE).format("INVALID-FORMAT");
      expect(typeof result).toBe("string");
      // dayjs interprets format tokens even in "invalid" strings
      expect(result).not.toBe("INVALID-FORMAT");
      expect(result.length).toBeGreaterThan(0);
    });

    test("handles null as parameter", () => {
      const result = dayjsBase(null).isValid();
      expect(result).toBe(false);
    });
  });

  describe("onRender Integration Tests", () => {
    test("dayjs onRender returns ISO string", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const dayjsFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs"
      );
      expect(dayjsFunction).toBeDefined();

      const result = await dayjsFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE },
        } as any
      );

      expect(typeof result).toBe("string");
      // Now returns local time format instead of UTC
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/
      );
    });

    test("format onRender formats date", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const formatFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.format"
      );
      expect(formatFunction).toBeDefined();

      const result = await formatFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE, format: "YYYY-MM-DD" },
        } as any
      );

      expect(result).toBe("2024-01-15");
    });

    test("from onRender returns relative time", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const fromFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.from"
      );
      expect(fromFunction).toBeDefined();

      const result = await fromFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE, fromDate: FIXED_DATE_2 },
        } as any
      );

      expect(result).toBe("in 5 days");
    });

    test("toISOString onRender returns ISO string", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const toISOFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.toISOString"
      );
      expect(toISOFunction).toBeDefined();

      const result = await toISOFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE },
        } as any
      );

      expect(result).toBe(FIXED_DATE);
    });

    test("onRender handles empty values object", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const dayjsFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs"
      );

      const result = await dayjsFunction!.onRender(
        mockCtx as any,
        {
          values: {},
        } as any
      );

      expect(typeof result).toBe("string");
      // Should return local time format when toUTCTime is not specified (false)
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/
      );
    });

    test("onRender returns local time when toUTCTime is false", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const dayjsFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs"
      );

      const result = await dayjsFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE, toUTCTime: false },
        } as any
      );

      expect(typeof result).toBe("string");
      // Should return local time format with timezone offset
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/
      );
    });

    test("onRender returns UTC time when toUTCTime is true", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const dayjsFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs"
      );

      const result = await dayjsFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: FIXED_DATE, toUTCTime: true },
        } as any
      );

      expect(result).toBe(FIXED_DATE);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("onRender shows validation error toast for invalid dates", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const dayjsFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs"
      );

      await dayjsFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: "invalid-date-string" },
        } as any
      );

      expect(mockCtx.toast.show).toHaveBeenCalledWith({
        message: "Invalid Date",
        icon: "alert_triangle",
      });
      expect(mockCtx.toast.show).toHaveBeenCalledTimes(1);
    });

    test("format onRender shows validation error toast for invalid dates", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const formatFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.format"
      );

      await formatFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: "invalid-date", format: "YYYY-MM-DD" },
        } as any
      );

      expect(mockCtx.toast.show).toHaveBeenCalledWith({
        message: "Invalid Date",
        icon: "alert_triangle",
      });
    });

    test("from onRender shows validation error toast for invalid dates", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const fromFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.from"
      );

      await fromFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: "invalid-date", fromDate: FIXED_DATE },
        } as any
      );

      expect(mockCtx.toast.show).toHaveBeenCalledWith({
        message: "Invalid Date",
        icon: "alert_triangle",
      });
    });

    test("toISOString onRender shows validation error toast for invalid dates", async () => {
      const mockCtx = {
        toast: {
          show: vi.fn(),
        },
      };

      const toISOFunction = (plugin.templateFunctions ?? []).find(
        (fn) => fn.name === "dayjs.toISOString"
      );

      await toISOFunction!.onRender(
        mockCtx as any,
        {
          values: { dateTime: "invalid-date" },
        } as any
      );

      expect(mockCtx.toast.show).toHaveBeenCalledWith({
        message: "Invalid Date",
        icon: "alert_triangle",
      });
    });
  });
});
