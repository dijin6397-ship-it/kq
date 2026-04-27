const api = require('../../utils/http.js');
const { showToast, navigateTo } = require('../../utils/dd.js');

Page({
  data: {
    currentTab: 'list',
    currentType: 'all',
    currentStatus: 'all',
    currentTypeLabel: '全部类型',
    currentStatusLabel: '全部状态',
    approvalList: [],
    createType: 'leave',
    formData: {},
    leaveTypeOptions: [
      { value: 'annual', label: '年假' },
      { value: 'sick', label: '病假' },
      { value: 'personal', label: '事假' },
      { value: 'marriage', label: '婚假' },
      { value: 'maternity', label: '产假' },
      { value: 'paternity', label: '陪产假' },
      { value: 'bereavement', label: '丧假' },
      { value: 'compensatory', label: '调休假' },
      { value: 'other', label: '其他' },
    ],
    overtimeTypeOptions: [
      { value: 'workday', label: '工作日加班' },
      { value: 'weekend', label: '休息日加班' },
      { value: 'holiday', label: '节假日加班' },
    ],
    patchTypeOptions: [
      { value: 'check_in', label: '上班补卡' },
      { value: 'check_out', label: '下班补卡' },
    ],
    typeOptions: [
      { value: 'all', label: '全部类型' },
      { value: 'leave', label: '请假' },
      { value: 'overtime', label: '加班' },
      { value: 'patch_card', label: '补卡' },
    ],
    statusOptions: [
      { value: 'all', label: '全部状态' },
      { value: 'pending', label: '待审批' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已拒绝' },
    ],
    leaveTypeLabel: '',
    overtimeTypeLabel: '',
    patchTypeLabel: '',
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ currentTab: 'create', createType: options.type });
    }
    this.loadApprovalList();
  },

  onShow() {
    if (this.data.currentTab === 'list') {
      this.loadApprovalList();
    }
  },

  async loadApprovalList() {
    try {
      const params = {};
      if (this.data.currentType !== 'all') params.type = this.data.currentType;
      if (this.data.currentStatus !== 'all') params.status = this.data.currentStatus;
      const list = await api.approval.list(params);
      this.setData({ approvalList: list || [] });
    } catch (err) {
      console.error('Load approval list failed:', err);
    }
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  onTypeChange(e) {
    const item = this.data.typeOptions[e.detail.value];
    this.setData({ currentType: item.value, currentTypeLabel: item.label });
    this.loadApprovalList();
  },

  onStatusChange(e) {
    const item = this.data.statusOptions[e.detail.value];
    this.setData({ currentStatus: item.value, currentStatusLabel: item.label });
    this.loadApprovalList();
  },

  onSelectCreateType(e) {
    this.setData({ createType: e.currentTarget.dataset.type, formData: {} });
  },

  onLeaveTypeChange(e) {
    const item = this.data.leaveTypeOptions[e.detail.value];
    this.setData({ leaveTypeLabel: item.label, 'formData.leaveType': item.value });
  },

  onLeaveStartDateChange(e) {
    this.setData({ 'formData.startDate': e.detail.value });
  },

  onLeaveEndDateChange(e) {
    this.setData({ 'formData.endDate': e.detail.value });
  },

  onDurationInput(e) {
    this.setData({ 'formData.durationDays': e.detail.value });
  },

  onReasonInput(e) {
    this.setData({ 'formData.reason': e.detail.value });
  },

  async submitLeave() {
    try {
      await api.approval.leave(this.data.formData);
      showToast('提交成功', 'success');
      this.setData({ currentTab: 'list' });
      this.loadApprovalList();
    } catch (err) {
      showToast('提交失败', 'none');
    }
  },

  onOvertimeDateChange(e) {
    this.setData({ 'formData.overtimeDate': e.detail.value });
  },

  onOvertimeTypeChange(e) {
    const item = this.data.overtimeTypeOptions[e.detail.value];
    this.setData({ overtimeTypeLabel: item.label, 'formData.dayType': item.value });
  },

  onOvertimeHoursInput(e) {
    this.setData({ 'formData.durationHours': e.detail.value });
  },

  onOvertimeReasonInput(e) {
    this.setData({ 'formData.reason': e.detail.value });
  },

  async submitOvertime() {
    try {
      await api.approval.overtime(this.data.formData);
      showToast('提交成功', 'success');
      this.setData({ currentTab: 'list' });
      this.loadApprovalList();
    } catch (err) {
      showToast('提交失败', 'none');
    }
  },

  onPatchDateChange(e) {
    this.setData({ 'formData.patchDate': e.detail.value });
  },

  onPatchTypeChange(e) {
    const item = this.data.patchTypeOptions[e.detail.value];
    this.setData({ patchTypeLabel: item.label, 'formData.patchType': item.value });
  },

  onPatchReasonInput(e) {
    this.setData({ 'formData.reason': e.detail.value });
  },

  async submitPatchCard() {
    try {
      await api.approval.patchCard(this.data.formData);
      showToast('提交成功', 'success');
      this.setData({ currentTab: 'list' });
      this.loadApprovalList();
    } catch (err) {
      showToast('提交失败', 'none');
    }
  },

  onTripStartDateChange(e) {
    this.setData({ 'formData.startDate': e.detail.value });
  },

  onTripEndDateChange(e) {
    this.setData({ 'formData.endDate': e.detail.value });
  },

  onDestinationInput(e) {
    this.setData({ 'formData.destination': e.detail.value });
  },

  onTripReasonInput(e) {
    this.setData({ 'formData.reason': e.detail.value });
  },

  async submitBusinessTrip() {
    try {
      await api.approval.businessTrip(this.data.formData);
      showToast('提交成功', 'success');
      this.setData({ currentTab: 'list' });
      this.loadApprovalList();
    } catch (err) {
      showToast('提交失败', 'none');
    }
  },

  onItemTap(e) {
    const item = e.currentTarget.dataset.item;
    dd.navigateTo({ url: `/pages/approval/detail?type=${item._type}&id=${item.id}` });
  },

  getTypeName(type) {
    const map = { leave: '请假', overtime: '加班', patch_card: '补卡', business_trip: '出差' };
    return map[type] || '申请';
  },

  getStatusName(status) {
    const map = { pending: '待审批', approved: '已通过', rejected: '已拒绝', withdrawn: '已撤回' };
    return map[status] || status;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  getDuration(item) {
    if (item.durationDays) return `${item.durationDays}天`;
    if (item.durationHours) return `${item.durationHours}小时`;
    return '';
  },
});