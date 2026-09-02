// Calculation results come back from the backend as arbitrary-precision
// decimal strings (e.g. "1.3831091039999999") so the underlying value never
// loses precision to JS floats — this is display-only rounding for the UI,
// never sent back to the API or used in any further computation.
export function formatDecimal(value: string, maxDecimals = 4): string {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}
