// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill Request, Response, and Headers for Jest using node-fetch v2
const { Request, Response, Headers } = require('node-fetch');
if (!globalThis.Request) globalThis.Request = Request;
if (!globalThis.Response) globalThis.Response = Response;
if (!globalThis.Headers) globalThis.Headers = Headers;

// Mock environment variables
process.env.LANGFLOW_API_URL = 'http://localhost:7860';

// Mock fetch globally as a Jest function
global.fetch = jest.fn();

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data, init) => {
        const response = new Response(JSON.stringify(data), {
          status: init?.status || 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        response.json = () => Promise.resolve(data);
        return response;
      },
    },
  };
});

// Mock Request.json for all tests
if (!Request.prototype.json) {
  Request.prototype.json = function () {
    return Promise.resolve(JSON.parse(this._bodyInit || '{}'));
  };
} 