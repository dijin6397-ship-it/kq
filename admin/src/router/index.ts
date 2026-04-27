import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '仪表盘', breadcrumb: '仪表盘' },
  },
  {
    path: '/attendance-group',
    name: 'AttendanceGroup',
    component: () => import('@/views/attendance-group/index.vue'),
    meta: { title: '考勤组', breadcrumb: '考勤组管理' },
  },
  {
    path: '/shifts',
    name: 'Shifts',
    component: () => import('@/views/shifts/index.vue'),
    meta: { title: '班次管理', breadcrumb: '班次管理' },
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('@/views/records/index.vue'),
    meta: { title: '考勤记录', breadcrumb: '考勤记录' },
  },
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('@/views/approval/index.vue'),
    meta: { title: '审批管理', breadcrumb: '审批管理' },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/reports/index.vue'),
    meta: { title: '数据报表', breadcrumb: '数据报表' },
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('@/views/notification/index.vue'),
    meta: { title: '消息推送', breadcrumb: '消息推送' },
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '系统设置', breadcrumb: '系统设置' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;