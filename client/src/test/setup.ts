import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Dọn dẹp sau mỗi lần test
afterEach(() => {
  cleanup();
});
