const api = require('../../utils/http.js');
const { getLocation, chooseImage, showToast } = require('../../utils/dd.js');

Page({
  data: {
    currentTime: '',
    currentAddress: '',
    currentLocation: null,
    photoUrl: '',
    remark: '',
    historyList: [],
    workDate: new Date().toISOString().split('T')[0],
  },

  onLoad() {
    this.updateTime();
    this.refreshLocation();
    this.loadHistory();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  updateTime() {
    const now = new Date();
    this.setData({
      currentTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    });
  },

  async refreshLocation() {
    try {
      const location = await getLocation({ type: 1 });
      this.setData({
        currentLocation: location,
        currentAddress: '北京市朝阳区某地（模拟地址）',
      });
    } catch (err) {
      showToast('获取定位失败', 'none');
    }
  },

  async takePhoto() {
    try {
      const res = await chooseImage({ count: 1 });
      this.setData({ photoUrl: res.filePaths[0] });
    } catch (err) {
      showToast('拍照失败', 'none');
    }
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async loadHistory() {
    try {
      const list = await api.fieldWork.list();
      this.setData({ historyList: list || [] });
    } catch (err) {
      console.error('Load history failed:', err);
    }
  },

  async onCheckin() {
    if (!this.data.currentLocation) {
      showToast('请先获取定位', 'none');
      return;
    }

    try {
      await api.fieldWork.checkin({
        latitude: this.data.currentLocation.latitude,
        longitude: this.data.currentLocation.longitude,
        address: this.data.currentAddress,
        photoUrl: this.data.photoUrl,
        remark: this.data.remark,
        workDate: this.data.workDate,
      });
      showToast('签到成功', 'success');
      this.loadHistory();
    } catch (err) {
      showToast('签到失败', 'none');
    }
  },

  formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
});