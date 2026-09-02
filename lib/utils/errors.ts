import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof AxiosError)) {
    // A plain thrown Error (e.g. our own stage-labeled rethrows in the
    // upload flow, or a native TypeError) has a useful .message — surface
    // it instead of collapsing everything to the same generic text.
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "An error occurred. Please try again.";
  }

  if (!error.response) {
    // No response at all — a network-level failure (offline, timeout, DNS,
    // or CORS blocking the request before any HTTP status came back). This
    // is exactly what a CORS-blocked direct-to-storage upload looks like.
    return (
      error.message || "Could not reach the server. Check your connection and try again."
    );
  }

  if (error.response.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error.response.status === 403) {
    return "You don't have permission to perform this action.";
  }
  if (error.response.status === 404) {
    return "Resource not found.";
  }

  const message = error.response.data?.error?.message;
  if (typeof message === "string") {
    return message;
  }

  // FastAPI's default (unwrapped) validation error shape — distinct from
  // this backend's usual {error: {message}} envelope, but real endpoints do
  // sometimes fall through to it (e.g. raw pydantic validation failures).
  const detail = error.response.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first.msg === "string") {
      return first.msg;
    }
  }

  return "An error occurred. Please try again.";
}
