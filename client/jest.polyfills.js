/* eslint-disable @typescript-eslint/no-require-imports */

// Polyfills for TextEncoder/TextDecoder required by MSW
const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  BroadcastChannel: class BroadcastChannel {
    constructor(name) {
      this.name = name;
    }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    onmessage() {}
    onmessageerror() {}
  },
});

// Polyfill for Fetch API
require('whatwg-fetch');
