// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder in Node.js test environment
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream } from "stream/web";

// Setup globals for Node.js test environment
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Polyfill Web Streams API needed by undici and Next.js
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = ReadableStream;
}
if (typeof global.TransformStream === "undefined") {
  global.TransformStream = TransformStream;
}

// Polyfill MessagePort for undici (minimal implementation)
if (typeof global.MessagePort === "undefined") {
  global.MessagePort = class MessagePort {
    constructor() {}
    postMessage() {}
    start() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {}
    onmessage() {}
    onmessageerror() {}
  };
}

// Polyfill MessageChannel for undici
if (typeof global.MessageChannel === "undefined") {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = new global.MessagePort();
      this.port2 = new global.MessagePort();
    }
  };
}

// Import undici for Request/Response/Headers polyfills needed for Next.js API routes
const { Request, Response, Headers, fetch: undiciFetch } = require("undici");

// Ensure Request/Response/Headers are available globally for Next.js
if (typeof global.Request === "undefined") {
  global.Request = Request;
}
if (typeof global.Response === "undefined") {
  global.Response = Response;
}
if (typeof global.Headers === "undefined") {
  global.Headers = Headers;
}
if (typeof global.fetch === "undefined") {
  global.fetch = undiciFetch;
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Suppress console errors in tests (optional - remove if you want to see errors)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
