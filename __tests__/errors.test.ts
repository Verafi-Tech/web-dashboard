import { AxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils/errors";

function axiosErrorWithStatus(status: number, message?: string): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    status,
    data: message ? { error: { message } } : {},
    statusText: "",
    headers: {},
    config: {} as never,
  };
  return error;
}

describe("getErrorMessage", () => {
  it("returns a session-expired message for 401", () => {
    expect(getErrorMessage(axiosErrorWithStatus(401))).toBe(
      "Session expired. Please login again."
    );
  });

  it("returns a permission message for 403", () => {
    expect(getErrorMessage(axiosErrorWithStatus(403))).toBe(
      "You don't have permission to perform this action."
    );
  });

  it("returns a not-found message for 404", () => {
    expect(getErrorMessage(axiosErrorWithStatus(404))).toBe(
      "Resource not found."
    );
  });

  it("surfaces the backend's error message when present", () => {
    expect(getErrorMessage(axiosErrorWithStatus(422, "Validation error"))).toBe(
      "Validation error"
    );
  });

  it("surfaces a plain Error's own message instead of a generic fallback", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("falls back to a generic message when there's nothing else to go on", () => {
    expect(getErrorMessage("not an error object")).toBe(
      "An error occurred. Please try again."
    );
  });

  it("surfaces axios's own message for a network-level failure with no response", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error)).toBe("Network Error");
  });

  it("falls back to the FastAPI default 'detail' shape when there's no error.message", () => {
    const error = axiosErrorWithStatus(422);
    error.response!.data = { detail: "Field required" };
    expect(getErrorMessage(error)).toBe("Field required");
  });

  it("surfaces the first validation issue from a FastAPI 'detail' array", () => {
    const error = axiosErrorWithStatus(422);
    error.response!.data = { detail: [{ loc: ["body", "file_hash"], msg: "String should have at least 64 characters", type: "string_too_short" }] };
    expect(getErrorMessage(error)).toBe("String should have at least 64 characters");
  });
});
