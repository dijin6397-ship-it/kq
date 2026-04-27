import request from './request';

export const login = (authCode: string) => {
  return request.post<{ token: string; user: any }>('/auth/login', { authCode });
};

export const getProfile = () => {
  return request.get<any>('/auth/profile');
};