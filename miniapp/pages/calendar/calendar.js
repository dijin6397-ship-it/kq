const api = require('../../utils/http.js');

Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarRows: [],
    selectedDay: null,
  },

  onLoad() {
    this.loadCalendar();
  },

  onShow() {
    this.loadCalendar();
  },

  async loadCalendar() {
    try {
      const data = await api.calendar.list(this.data.year, this.data.month);
      this.renderCalendar(data.days);
    } catch (err) {
      console.error('Load calendar failed:', err);
    }
  },

  renderCalendar(days) {
    const firstDay = new Date(this.data.year, this.data.month - 1, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();

    const calendarDays = [];

    for (let i = 0; i < startWeekday; i++) {
      calendarDays.push({ dayNumber: '', date: '', status: 'empty' });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = days.find((d) => d.date === dateStr) || {};
      calendarDays.push({
        dayNumber: day,
        date: dateStr,
        status: dayData.status || 'normal',
        checkInTime: dayData.checkInTime ? this.formatTime(dayData.checkInTime) : null,
        checkOutTime: dayData.checkOutTime ? this.formatTime(dayData.checkOutTime) : null,
        shiftName: dayData.shiftName,
      });
    }

    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push({ days: calendarDays.slice(i, i + 7) });
    }

    while (rows.length < 6) {
      rows.push({ days: Array(7).fill({ dayNumber: '', date: '', status: 'empty' }) });
    }

    this.setData({ calendarRows: rows });
  },

  formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
    this.loadCalendar();
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
    this.loadCalendar();
  },

  onDayTap(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;

    const dayData = this.data.calendarRows
      .flatMap((row) => row.days)
      .find((d) => d.date === date);

    if (dayData && dayData.status !== 'empty') {
      this.setData({ selectedDay: dayData });
    }
  },

  getStatusText(status) {
    const map = {
      normal: '正常',
      late: '迟到',
      early_leave: '早退',
      absent: '缺勤',
      leave: '请假',
      overtime: '加班',
      field_work: '外勤',
      weekend: '周末',
      holiday: '节假日',
    };
    return map[status] || '正常';
  },
});