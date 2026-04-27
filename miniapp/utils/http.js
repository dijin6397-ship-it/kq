const app = getApp();

function request(options) {
  const { url, method = 'GET', data, header = {} } = options;

  return new Promise((resolve, reject) => {
    const token = app?.getToken?.() || '';

    dd.httpRequest({
      url: `${app?.globalData?.apiBase || ''}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header,
      },
      success: (res) => {
        if (res.status === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            dd.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            });
            reject(res.data);
          }
        } else {
          dd.showToast({
            title: `网络错误: ${res.status}`,
            icon: 'none',
          });
          reject(res);
        }
      },
      fail: (err) => {
        dd.showToast({
          title: '网络请求失败',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

function get(url, params = {}) {
  let queryString = '';
  const keys = Object.keys(params);
  if (keys.length > 0) {
    queryString = '?' + keys.map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&');
  }
  return request({ url: `${url}${queryString}`, method: 'GET', data: params });
}

function post(url, data = {}) {
  return request({ url, method: 'POST', data });
}

function put(url, data = {}) {
  return request({ url, method: 'PUT', data });
}

function delete_(url, data = {}) {
  return request({ url, method: 'DELETE', data });
}

const api = {
  auth: {
    login: (authCode) => post('/auth/login', { authCode }),
    profile: () => get('/auth/profile'),
  },
  attendance: {
    today: () => get('/attendance/today'),
    todayDetail: () => get('/attendance/today/detail'),
  },
  calendar: {
    list: (year, month) => get('/calendar', { year, month }),
  },
  approval: {
    list: (params) => get('/approval/list', params),
    leave: (data) => post('/approval/leave', data),
    overtime: (data) => post('/approval/overtime', data),
    patchCard: (data) => post('/approval/patch-card', data),
    businessTrip: (data) => post('/approval/business-trip', data),
    detail: (type, id) => get(`/approval/${type}/${id}`),
  },
  fieldWork: {
    checkin: (data) => post('/field-work/checkin', data),
    list: (date) => get('/field-work/list', { date }),
    today: () => get('/field-work/today'),
  },
  schedule: {
    my: (year, month) => get('/schedule/my', { year, month }),
    shifts: () => get('/schedule/shifts'),
    groups: () => get('/schedule/groups'),
  },
  statistics: {
    personal: (year, month) => get('/statistics/personal', { year, month }),
    department: (deptId, year, month) => get('/statistics/department', { deptId, year, month }),
  },
  notification: {
    unread: () => get('/notification/unread'),
    read: (id) => post(`/notification/read/${id}`),
  },
};

export { request, get, post, put, delete_ };
export default api;