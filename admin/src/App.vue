<template>
  <div class="app-container">
    <el-container>
      <el-aside width="220px" v-if="!isLoginPage">
        <div class="logo">
          <el-icon :size="24"><Calendar /></el-icon>
          <span>智勤考勤</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/attendance-group">
            <el-icon><Setting /></el-icon>
            <span>考勤组</span>
          </el-menu-item>
          <el-menu-item index="/shifts">
            <el-icon><Clock /></el-icon>
            <span>班次管理</span>
          </el-menu-item>
          <el-menu-item index="/records">
            <el-icon><Document /></el-icon>
            <span>考勤记录</span>
          </el-menu-item>
          <el-menu-item index="/approval">
            <el-icon><Files /></el-icon>
            <span>审批管理</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><DataLine /></el-icon>
            <span>数据报表</span>
          </el-menu-item>
          <el-menu-item index="/notification">
            <el-icon><Bell /></el-icon>
            <span>消息推送</span>
          </el-menu-item>
          <el-menu-item index="/system">
            <el-icon><Tools /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header v-if="!isLoginPage" height="60px">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="route.meta.breadcrumb">
                {{ route.meta.breadcrumb }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :src="userStore.avatar" />
                <span class="username">{{ userStore.name }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main :class="{ 'login-main': isLoginPage }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isLoginPage = computed(() => route.path === '/login');
const activeMenu = computed(() => route.path);

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    router.push('/login');
    ElMessage.success('已退出登录');
  } else if (command === 'profile') {
    router.push('/profile');
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #3d4a5a;
}

.sidebar-menu {
  border-right: none;
}

.el-header {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}

.login-main {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, #0d6efd);
}
</style>