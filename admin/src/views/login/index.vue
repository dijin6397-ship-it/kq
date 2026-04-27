<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="48" color="#ffffff"><Calendar /></el-icon>
        <h1>智勤考勤管理系统</h1>
        <p>智能考勤解决方案</p>
      </div>
      <el-form class="login-form">
        <el-form-item>
          <el-input
            v-model="authCode"
            placeholder="请输入钉钉授权码"
            size="large"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const authCode = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!authCode.value) {
    ElMessage.warning('请输入授权码');
    return;
  }

  loading.value = true;
  try {
    await userStore.login(authCode.value);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (err) {
    ElMessage.error('登录失败，请检查授权码');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, #0d6efd);
}

.login-box {
  width: 400px;
  padding: 48px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 24px;
}
</style>