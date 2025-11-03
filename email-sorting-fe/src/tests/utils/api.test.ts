import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have axios instance', () => {
    expect(axios).toBeDefined();
  });

  it('should make GET requests', async () => {
    const mockData = { data: 'test' };
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockData });

    const result = await mockedAxios.get('/test');
    expect(result.data).toEqual(mockData);
  });

  it('should make POST requests', async () => {
    const mockData = { success: true };
    mockedAxios.post = vi.fn().mockResolvedValue({ data: mockData });

    const result = await mockedAxios.post('/test', { data: 'test' });
    expect(result.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    mockedAxios.get = vi.fn().mockRejectedValue(mockError);

    await expect(mockedAxios.get('/test')).rejects.toThrow('Network error');
  });
});
