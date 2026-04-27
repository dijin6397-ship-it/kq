const api = require('../../utils/http.js');
const { getLocation, showToast, confirm } = require('../../utils/dd.js');

Page({
  data: {
    weekday: '',
    dateStr: '',
    weather: '晴 26°C',
    currentTime: '',
    record: {
      checkInTime: null,
      checkOutTime: null,
      checkInResult: null,
      checkOutResult: null,
      isLate: false,
      isEarlyLeave: false,
      lateMinutes: 0,
      earlyMinutes: 0,
    },
    announcements: [],
    canCheckIn: true,
    canCheckOut: false,
  },

  onLoad() {
    this.updateTime();
    this.loadTodayStatus();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  onShow() {
    this.loadTodayStatus();
  },

  updateTime() {
    const now = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    this.setData({
      weekday: weekdays[now.getDay()],
      dateStr: `${now.getMonth() + 1}月${now.getDate()}日`,
      currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    });
  },

  async loadTodayStatus() {
    try {
      const data = await api.attendance.today();
      this.setData({
        record: data,
        canCheckIn: !data.checkInTime,
        canCheckOut: !!data.checkInTime && !data.checkOutTime,
        statusText: this.getStatusText(data),
        statusClass: this.getStatusClass(data),
      });
    } catch (err) {
      console.error('Load today status failed:', err);
    }
  },

  getStatusText(record) {
    if (record.checkOutTime && record.checkOutResult === 'Normal') return '已打卡';
    if (record.checkInTime && record.checkInResult === 'Normal') return '上班已打';
    if (!record.checkInTime) return '未打卡';
    return '打卡异常';
  },

  getStatusClass(record) {
    if (record.checkOutTime && record.checkOutResult === 'Normal') return 'success';
    if (record.checkInTime && record.checkInResult === 'Normal') return 'warning';
    if (record.isLate || record.isEarlyLeave) return 'danger';
    return 'default';
  },

  async onCheckIn() {
    if (!this.data.canCheckIn) return;

    const location = await getLocation({ type: 1 });
    if (!location) {
      showToast('获取定位失败', 'none');
      return;
    }

    showToast('打卡成功', 'success');
    this.loadTodayStatus();
  },

  async onCheckOut() {
    if (!this.data.canCheckOut) return;

    const location = await getLocation({ type: 1 });
    if (!location) {
      showToast('获取定位失败', 'none');
      return;
    }

    showToast('下班打卡成功', 'success');
    this.loadTodayStatus();
  },

  goToLeave() {
    dd.navigateTo({ url: '/pages/approval/approval?type=leave' });
  },

  goToOvertime() {
    dd.navigateTo({ url: '/pages/approval/approval?type=overtime' });
  },

  goToPatchCard() {
    dd.navigateTo({ url: '/pages/approval/approval?type=patch_card' });
  },

  goToFieldWork() {
    dd.navigateTo({ url: '/pages/field-work/field-work' });
  },
});