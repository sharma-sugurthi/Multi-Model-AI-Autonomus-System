import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    LANGFLOW_API_URL: 'http://localhost:7860',
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock Response
const mockResponse = {
  json: vi.fn(),
  text: vi.fn(),
  status: 200,
  ok: true,
};

global.Response = vi.fn(() => mockResponse) as any;

// Mock Request
global.Request = vi.fn() as any; 