<template>
  <div class="approval-page">
    <div class="page-header">
      <h1 class="page-title">审批管理</h1>
    </div>

    <div class="card-container">
      <div class="filter-bar">
        <el-select v-model="filterType" placeholder="审批类型" clearable @change="loadApprovals">
          <el-option label="请假" value="leave" />
          <el-option label="加班" value="overtime" />
          <el-option label="补卡" value="patch_card" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="审批状态" clearable @change="loadApprovals">
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>

      <el-table :data="approvals" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user.name" label="申请人" width="100" />
        <el-table-column prop="_type" label="类型" width="100">
          <template #default="{ row }">
            {{ getTypeName(row._type) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalInstanceId" label="审批实例ID" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link v-if="row.status === 'pending'" @click="handleApprove(row)">
              通过
            </el-button>
            <el-button type="danger" link v-if="row.status === 'pending'" @click="handleReject(row)">
              拒绝
            </el-button>
            <el-button type="info" link v-else @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import request from '@/api/request';

const loading = ref(false);
const approvals = ref<any[]>([]);
const filterType = ref('');
const filterStatus = ref('pending');

async function loadApprovals() {
  loading.value = true;
  try {
    const params: any = {};
    if (filterType.value) params.type = filterType.value;
    if (filterStatus.value) params.status = filterStatus.value;
    approvals.value = await request.get<any[]>('/approval/list', params);
  } catch (err) {
    console.error('Load approvals failed:', err);
  } finally {
    loading.value = false;
  }
}

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm('确认通过该审批？', '提示', { type: 'success' });
    ElMessage.success('审批已通过');
    loadApprovals();
  } catch (err) {
    // User cancelled
  }
}

async function handleReject(row: any) {
  try {
    await ElMessageBox.confirm('确认拒绝该审批？', '提示', { type: 'warning' });
    ElMessage.success('审批已拒绝');
    loadApprovals();
  } catch (err) {
    // User cancelled
  }
}

function handleView(row: any) {}

function getTypeName(type: string) {
  const map: Record<string, string> = {
    leave: '请假',
    overtime: '加班',
    patch_card: '补卡',
  };
  return map[type] || type;
}

function getStatusName(status: string) {
  const map: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    withdrawn: '已撤回',
  };
  return map[status] || status;
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
}

function formatDateTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

onMounted(() => {
  loadApprovals();
});
</script>