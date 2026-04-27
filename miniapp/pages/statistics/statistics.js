const api = require('../../utils/http.js');

Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    stats: {
      shouldAttend: 0,
      actualAttend: 0,
      lateDays: 0,
      earlyLeaveDays: 0,
      absentDays: 0,
      leaveDays: 0,
      overtimeHours: 0,
      overtimeDays: 0,
    },
    attendanceRate: 0,
  },

  onLoad() {
    this.loadStatistics();
  },

  onShow() {
    this.loadStatistics();
  },

  async loadStatistics() {
    try {
      const data = await api.statistics.personal(this.data.year, this.data.month);
      const rate = data.shouldAttend > 0 ? Math.round((data.actualAttend / data.shouldAttend) * 100) : 100;
      this.setData({
        stats: data,
        attendanceRate: rate,
      });
    } catch (err) {
      console.error('Load statistics failed:', err);
    }
  },

  prevMonth() {
    let { year, month } = this.data;
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    this.setData({ year, month });
    this.loadStatistics();
  },

  nextMonth() {
    let { year, month } = this.data;
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
    this.setData({ year, month });
    this.loadStatistics();
  },
});