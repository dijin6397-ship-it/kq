import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Request failed'));
    }
    return res.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const request = {
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, { params, ...config });
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config);
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config);
  },
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, { params, ...config });
  },
};

export default request;