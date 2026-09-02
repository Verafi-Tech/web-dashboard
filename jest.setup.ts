import "@testing-library/jest-dom";

// jsdom doesn't implement these — needed by any component that previews a
// locally-picked file before it's uploaded (e.g. FileUpload's image tile).
if (typeof URL.createObjectURL === "undefined") {
  URL.createObjectURL = jest.fn(() => "blob:mock-url");
}
if (typeof URL.revokeObjectURL === "undefined") {
  URL.revokeObjectURL = jest.fn();
}
