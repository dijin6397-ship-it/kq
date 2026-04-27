import './utils/dd.js';
import './utils/http.js';
import { getAuthCode } from './utils/dd.js';

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBase: 'https://your-domain.com/api',
  },

  onLaunch() {
    this.login();
  },

  async login() {
    try {
      const authCode = await getAuthCode();
      const res = await dd.httpRequest({
        url: `${this.globalData.apiBase}/auth/login`,
        method: 'POST',
        data: { authCode },
      });

      if (res.code === 200) {
        this.globalData.token = res.data.token;
        this.globalData.userInfo = res.data.user;
        dd.setStorageSync('token', res.data.token);
        dd.setStorageSync('userInfo', res.data.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  },

  getToken() {
    return this.globalData.token || dd.getStorageSync('token');
  },

  getUserInfo() {
    return this.globalData.userInfo || dd.getStorageSync('userInfo');
  },
});