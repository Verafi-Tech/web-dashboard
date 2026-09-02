import { formatBytes } from "@/lib/utils/format";

describe("formatBytes", () => {
  it("shows 0 B for zero or negative input", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
  });

  it("shows plain bytes under 1024", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("shows one decimal place in KB", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("shows MB for larger sizes", () => {
    expect(formatBytes(4 * 1024 * 1024)).toBe("4.0 MB");
  });

  it("shows GB for very large sizes", () => {
    expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
  });
});
