<template>
  <div class="records-page">
    <div class="page-header">
      <h1 class="page-title">考勤记录</h1>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>

    <div class="card-container">
      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadRecords"
        />
        <el-select v-model="filterUserId" placeholder="选择员工" clearable @change="loadRecords">
          <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
        </el-select>
      </div>

      <el-table :data="records" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="user.name" label="姓名" width="100" />
        <el-table-column prop="workDate" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.workDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="上班打卡" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.isLate }">
              {{ row.checkInTime ? formatTime(row.checkInTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="checkOutTime" label="下班打卡" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.isEarlyLeave }">
              {{ row.checkOutTime ? formatTime(row.checkOutTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="timeResult" label="考勤结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getResultType(row)">{{ row.timeResult || '正常' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lateMinutes" label="迟到(分)" width="100" />
        <el-table-column prop="earlyMinutes" label="早退(分)" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleCorrect(row)">修正</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadRecords"
        @current-change="loadRecords"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <el-dialog v-model="correctDialogVisible" title="修正打卡记录" width="400px">
      <el-form :model="correctForm" label-width="100px">
        <el-form-item label="上班打卡">
          <el-time-picker
            v-model="correctForm.checkInTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="下班打卡">
          <el-time-picker
            v-model="correctForm.checkOutTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="迟到">
          <el-switch v-model="correctForm.isLate" />
        </el-form-item>
        <el-form-item label="早退">
          <el-switch v-model="correctForm.isEarlyLeave" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCorrect">确定</el-button>
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
const records = ref<any[]>([]);
const users = ref<any[]>([]);
const dateRange = ref<[Date, Date]>([
  dayjs().startOf('month').toDate(),
  dayjs().endOf('month').toDate(),
]);
const filterUserId = ref<number>();
const pagination = reactive({
  page: 1,
  size: 50,
  total: 0,
});

const correctDialogVisible = ref(false);
const correctForm = reactive({
  id: 0,
  checkInTime: '',
  checkOutTime: '',
  isLate: false,
  isEarlyLeave: false,
});

async function loadRecords() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size,
    };
    if (dateRange.value) {
      params.startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD');
      params.endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD');
    }
    if (filterUserId.value) {
      params.userId = filterUserId.value;
    }
    const data = await request.get<any>('/admin/records', params);
    records.value = data.records || [];
    pagination.total = data.total || 0;
  } catch (err) {
    console.error('Load records failed:', err);
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

function handleExport() {
  window.open('/api/export?' + new URLSearchParams({
    startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
    endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD'),
    format: 'xlsx',
  }));
}

function handleCorrect(row: any) {
  correctForm.id = row.id;
  correctForm.checkInTime = row.checkInTime ? dayjs(row.checkInTime).format('HH:mm:ss') : '';
  correctForm.checkOutTime = row.checkOutTime ? dayjs(row.checkOutTime).format('HH:mm:ss') : '';
  correctForm.isLate = row.isLate;
  correctForm.isEarlyLeave = row.isEarlyLeave;
  correctDialogVisible.value = true;
}

async function handleSubmitCorrect() {
  try {
    await request.post(`/admin/records/${correctForm.id}/correct`, correctForm);
    ElMessage.success('修正成功');
    correctDialogVisible.value = false;
    loadRecords();
  } catch (err) {
    ElMessage.error('修正失败');
  }
}

function handleSelectionChange() {}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}

function formatTime(time: string) {
  return dayjs(time).format('HH:mm');
}

function getResultType(row: any) {
  if (row.isAbsent) return 'danger';
  if (row.isLate) return 'warning';
  if (row.isEarlyLeave) return 'warning';
  return 'success';
}

onMounted(() => {
  loadRecords();
  loadUsers();
});
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.text-danger {
  color: #ff4d4f;
}
</style>