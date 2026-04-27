const app = getApp();
const api = require('../../utils/http.js');
const { showToast, confirm } = require('../../utils/dd.js');

Page({
  data: {
    userInfo: {},
    unreadCount: 0,
  },

  onShow() {
    this.setData({
      userInfo: app?.getUserInfo?.() || {},
    });
    this.loadUnreadCount();
  },

  async loadUnreadCount() {
    try {
      const list = await api.notification.unread();
      this.setData({ unreadCount: list?.length || 0 });
    } catch (err) {
      console.error('Load unread count failed:', err);
    }
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type;

    if (type === 'schedule') {
      dd.navigateTo({ url: '/pages/calendar/calendar' });
    } else if (type === 'leave_balance') {
      dd.navigateTo({ url: '/pages/profile/balance?type=leave' });
    } else if (type === 'overtime_balance') {
      dd.navigateTo({ url: '/pages/profile/balance?type=overtime' });
    } else if (type === 'notification') {
      dd.navigateTo({ url: '/pages/profile/notification' });
    } else if (type === 'about') {
      dd.showModal({
        title: '智勤考勤',
        content: '版本 V1.0.0\n基于钉钉小程序的智能考勤系统',
      });
    }
  },

  async onLogout() {
    const result = await confirm('确认退出登录？', '退出后需要重新扫码登录');
    if (result) {
      app.globalData.token = null;
      app.globalData.userInfo = null;
      dd.removeStorageSync('token');
      dd.removeStorageSync('userInfo');
      dd.reLaunch({ url: '/pages/index/index' });
    }
  },
});