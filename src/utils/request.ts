import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

interface ErrorResponse {
  status?: number;
  message?: string;
  code?: number;
  error?: any;
}

const baseUrl = import.meta.env.VITE_BINANCE_API_URL || 'http://localhost:3000';

const request = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

// 处理错误响应
const handleError = (error: AxiosError<ErrorResponse>) => {
  if (error.response?.data) {
    const errorData = error.response.data?.error;
    // 如果服务端返回了错误信息，使用服务端的错误信息
    const errorMessage = errorData.message || '请求失败';
    toast({
      variant: "destructive",
      title: "错误",
      description: errorMessage,
    });
    throw new Error(errorMessage);
  } else if (error.request) {
    // 请求已发出但没有收到响应
    const errorMessage = '服务器无响应，请检查网络连接';
    toast({
      variant: "destructive",
      title: "错误",
      description: errorMessage,
    });
    throw new Error(errorMessage);
  } else {
    // 请求配置出错
    const errorMessage = error.message || '请求配置错误';
    toast({
      variant: "destructive",
      title: "错误",
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const get = async (url: string, params?: any, config?: RequestConfig) => {
  try {
    const response = await request.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const post = async (url: string, data?: any, config?: RequestConfig) => {
  try {
    const response = await request.post(url, data, config);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export default {
  get,
  post,
}; 