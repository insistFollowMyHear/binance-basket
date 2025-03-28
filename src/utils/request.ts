import axios from 'axios';

interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

const baseUrl = import.meta.env.VITE_BINANCE_API_URL || 'http://localhost:3000';

const request = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

export const get = async (url: string, params?: any, config?: RequestConfig) => {
  try {
    const response = await request.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const post = async (url: string, data?: any, config?: RequestConfig) => {
  try {
    const response = await request.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export default {
  get,
  post,
}; 