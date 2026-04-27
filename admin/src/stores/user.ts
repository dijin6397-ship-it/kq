import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as apiLogin } from '@/api/auth';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const id = ref<number>(0);
  const name = ref('');
  const avatar = ref('');
  const role = ref('');
  const departmentId = ref<number>(0);
  const departmentName = ref('');

  async function login(authCode: string) {
    try {
      const res = await apiLogin(authCode);
      token.value = res.token;
      localStorage.setItem('token', res.token);
      const user = res.user;
      id.value = user.id;
      name.value = user.name;
      avatar.value = user.avatar || '';
      role.value = user.role;
      departmentId.value = user.departmentId || 0;
      departmentName.value = user.departmentName || '';
      return true;
    } catch (error) {
      return false;
    }
  }

  function logout() {
    token.value = '';
    id.value = 0;
    name.value = '';
    avatar.value = '';
    role.value = '';
    localStorage.removeItem('token');
    router.push('/login');
  }

  function isAdmin() {
    return role.value === 'admin' || role.value === 'super_admin';
  }

  return {
    token,
    id,
    name,
    avatar,
    role,
    departmentId,
    departmentName,
    login,
    logout,
    isAdmin,
  };
});