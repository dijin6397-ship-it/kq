<template>
  <div class="notification-page">
    <div class="page-header">
      <h1 class="page-title">消息推送</h1>
      <el-button type="primary" @click="handleSendNotification">
        <el-icon><Plus /></el-icon>
        发送通知
      </el-button>
    </div>

    <div class="card-container">
      <el-table :data="notifications" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user.name" label="接收人" width="100" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            {{ getTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="isSent" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSent ? 'success' : 'info'">
              {{ row.isSent ? '已发送' : '待发送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="发送通知" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="接收人">
          <el-select v-model="form.userId" placeholder="选择员工" filterable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="form.type" placeholder="选择类型">
            <el-option label="迟到提醒" value="late_reminder" />
            <el-option label="缺卡提醒" value="missing_checkout" />
            <el-option label="审批通知" value="approval_result" />
            <el-option label="排班通知" value="schedule_change" />
            <el-option label="系统通知" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="通知标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="通知内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import request from '@/api/request';

const loading = ref(false);
const notifications = ref<any[]>([]);
const users = ref<any[]>([]);
const dialogVisible = ref(false);
const form = reactive({
  userId: 0,
  type: '',
  title: '',
  content: '',
});

async function loadNotifications() {
  loading.value = true;
  try {
    // Mock data for demo
    notifications.value = [
      { id: 1, user: { name: '张三' }, type: 'late_reminder', title: '上班迟到提醒', content: '您今日上班迟到 5 分钟...', isSent: true, createdAt: new Date().toISOString() },
      { id: 2, user: { name: '李四' }, type: 'missing_checkout', title: '下班缺卡提醒', content: '您今日下班未打卡...', isSent: true, createdAt: new Date().toISOString() },
    ];
  } catch (err) {
    console.error('Load notifications failed:', err);
  } finally {
    loading.value = false;
  }
}

async function loadUsers() {
  try {
    users.value = await request.get<any[]>('/admin/users');
  } catch (err) {
    console.error('Load users failed:', err);
  }
}

function handleSendNotification() {
  dialogVisible.value = true;
}

async function handleSubmit() {
  try {
    ElMessage.success('通知发送成功');
    dialogVisible.value = false;
    loadNotifications();
  } catch (err) {
    ElMessage.error('发送失败');
  }
}

function getTypeName(type: string) {
  const map: Record<string, string> = {
    late_reminder: '迟到提醒',
    missing_checkout: '缺卡提醒',
    approval_result: '审批通知',
    schedule_change: '排班通知',
    system: '系统通知',
  };
  return map[type] || type;
}

function formatDateTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

onMounted(() => {
  loadNotifications();
  loadUsers();
});
</script>