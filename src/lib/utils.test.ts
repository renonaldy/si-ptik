import { describe, it, expect } from "vitest";
import { cn, initialsOf } from "./utils";

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    const hidden = false as boolean;
    expect(cn("text-sm", hidden && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("initialsOf", () => {
  it("takes up to two uppercased initials", () => {
    expect(initialsOf("Budi Santoso")).toBe("BS");
    expect(initialsOf("andi")).toBe("A");
    expect(initialsOf("Dr. Andi Wijaya")).toBe("DA");
  });
  it("handles empty input", () => {
    expect(initialsOf("")).toBe("");
  });
});
