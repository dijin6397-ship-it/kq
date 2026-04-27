<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="loadDashboard"
      />
    </div>

    <el-row :gutter="24" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff">
            <el-icon :size="32" color="#1890ff"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">在职人数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f6ffed">
            <el-icon :size="32" color="#52c41a"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayCheckIn }}</div>
            <div class="stat-label">今日已打卡</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff7e6">
            <el-icon :size="32" color="#faad14"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingApprovals }}</div>
            <div class="stat-label">待审批</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff1f0">
            <el-icon :size="32" color="#ff4d4f"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.lateToday }}</div>
            <div class="stat-label">今日迟到</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="16">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">近7天考勤趋势</span>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">考勤状态分布</span>
          </div>
          <div ref="pieChartRef" class="chart-container-pie"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="12">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">最新考勤记录</span>
            <el-button type="primary" link @click="$router.push('/records')">查看更多</el-button>
          </div>
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="userName" label="姓名" width="100" />
            <el-table-column prop="workDate" label="日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.workDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="checkInTime" label="上班打卡" width="120">
              <template #default="{ row }">
                {{ row.checkInTime ? formatTime(row.checkInTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="checkOutTime" label="下班打卡">
              <template #default="{ row }">
                {{ row.checkOutTime ? formatTime(row.checkOutTime) : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">待审批事项</span>
            <el-button type="primary" link @click="$router.push('/approval')">查看更多</el-button>
          </div>
          <el-table :data="pendingApprovals" style="width: 100%">
            <el-table-column prop="userName" label="申请人" width="100" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                {{ getApprovalTypeName(row._type) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link size="small">审批</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import request from '@/api/request';

const dateRange = ref([
  dayjs().subtract(7, 'day').toDate(),
  dayjs().toDate(),
]);

const stats = ref({
  totalUsers: 0,
  todayCheckIn: 0,
  pendingApprovals: 0,
  lateToday: 0,
});

const recentRecords = ref<any[]>([]);
const pendingApprovals = ref<any[]>([]);

const trendChartRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

async function loadDashboard() {
  try {
    const data = await request.get<any>('/admin/dashboard');
    stats.value = data;
  } catch (err) {
    console.error('Load dashboard failed:', err);
  }
}

async function loadRecentRecords() {
  try {
    const data = await request.get<any>('/admin/records', { size: 10 });
    recentRecords.value = data.records || [];
  } catch (err) {
    console.error('Load records failed:', err);
  }
}

async function loadPendingApprovals() {
  try {
    const list = await request.get<any[]>('/approval/list', { status: 'pending' });
    pendingApprovals.value = list?.slice(0, 5) || [];
  } catch (err) {
    console.error('Load approvals failed:', err);
  }
}

function initTrendChart() {
  if (!trendChartRef.value) return;

  trendChart = echarts.init(trendChartRef.value);

  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day').format('MM-DD')
  );

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['正常', '迟到', '早退', '缺勤'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value' },
    series: [
      { name: '正常', type: 'line', data: [65, 72, 68, 75, 70, 78, 80], smooth: true },
      { name: '迟到', type: 'line', data: [3, 2, 5, 1, 3, 2, 1], smooth: true },
      { name: '早退', type: 'line', data: [1, 1, 2, 0, 1, 1, 0], smooth: true },
      { name: '缺勤', type: 'line', data: [0, 0, 1, 0, 0, 0, 0], smooth: true },
    ],
  });
}

function initPieChart() {
  if (!pieChartRef.value) return;

  pieChart = echarts.init(pieChartRef.value);

  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        data: [
          { value: 580, name: '正常', itemStyle: { color: '#52c41a' } },
          { value: 40, name: '迟到', itemStyle: { color: '#faad14' } },
          { value: 20, name: '早退', itemStyle: { color: '#1890ff' } },
          { value: 10, name: '缺勤', itemStyle: { color: '#ff4d4f' } },
        ],
      },
    ],
  });
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}

function formatTime(time: string) {
  return dayjs(time).format('HH:mm');
}

function formatDateTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm');
}

function getApprovalTypeName(type: string) {
  const map: Record<string, string> = {
    leave: '请假',
    overtime: '加班',
    patch_card: '补卡',
    business_trip: '出差',
  };
  return map[type] || type;
}

function handleResize() {
  trendChart?.resize();
  pieChart?.resize();
}

onMounted(() => {
  loadDashboard();
  loadRecentRecords();
  loadPendingApprovals();
  initTrendChart();
  initPieChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
}

.chart-container-pie {
  height: 300px;
}
</style>