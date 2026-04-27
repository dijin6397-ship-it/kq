function getAuthCode() {
  return new Promise((resolve, reject) => {
    dd.getAuthCode({
      success: (res) => {
        resolve(res.authCode);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    dd.getUserInfo({
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function getLocation(params = {}) {
  return new Promise((resolve, reject) => {
    dd.getLocation({
      ...params,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function chooseImage(params = {}) {
  return new Promise((resolve, reject) => {
    dd.chooseImage({
      ...params,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function showToast(title, icon = 'none') {
  dd.showToast({ title, icon });
}

function showLoading(title = '加载中...') {
  dd.showLoading({ content: title });
}

function hideLoading() {
  dd.hideLoading();
}

function confirm(title, content) {
  return new Promise((resolve) => {
    dd.confirm({
      title,
      content,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        resolve(res.confirm);
      },
    });
  });
}

function navigateTo(url) {
  dd.navigateTo({ url });
}

function redirectTo(url) {
  dd.redirectTo({ url });
}

function reLaunch(url) {
  dd.reLaunch({ url });
}

function switchTab(url) {
  dd.switchTab({ url });
}

function setStorage(key, value) {
  dd.setStorageSync(key, value);
}

function getStorage(key) {
  return dd.getStorageSync(key);
}

function removeStorage(key) {
  dd.removeStorageSync(key);
}

function makePhoneCall(phoneNumber) {
  dd.makePhoneCall({ phoneNumber });
}

function scanCode(params = {}) {
  return new Promise((resolve, reject) => {
    dd.scan({
      ...params,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export {
  getAuthCode,
  getUserInfo,
  getLocation,
  chooseImage,
  showToast,
  showLoading,
  hideLoading,
  confirm,
  navigateTo,
  redirectTo,
  reLaunch,
  switchTab,
  setStorage,
  getStorage,
  removeStorage,
  makePhoneCall,
  scanCode,
};