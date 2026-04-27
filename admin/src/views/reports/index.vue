<template>
  <div class="reports-page">
    <div class="page-header">
      <h1 class="page-title">数据报表</h1>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <el-row :gutter="24">
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
            <div class="stat-value">{{ stats.attendanceRate }}%</div>
            <div class="stat-label">出勤率</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff7e6">
            <el-icon :size="32" color="#faad14"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.lateRate }}%</div>
            <div class="stat-label">迟到率</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff1f0">
            <el-icon :size="32" color="#ff4d4f"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.absentRate }}%</div>
            <div class="stat-label">缺勤率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="12">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">部门考勤对比</span>
          </div>
          <div ref="deptChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">考勤异常排行</span>
          </div>
          <el-table :data="anomalyRanking" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="department" label="部门" />
            <el-table-column prop="lateCount" label="迟到次数" />
            <el-table-column prop="earlyCount" label="早退次数" />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="24">
        <div class="card-container">
          <div class="card-header">
            <span class="card-title">月度考勤趋势</span>
          </div>
          <div ref="trendChartRef" class="chart-container-large"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import request from '@/api/request';

const stats = reactive({
  totalUsers: 0,
  attendanceRate: 0,
  lateRate: 0,
  absentRate: 0,
});

const anomalyRanking = ref<any[]>([]);

const deptChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();
let deptChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;

function handleExport() {
  const now = new Date();
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
  window.open(`/api/export?startDate=${startDate}&endDate=${endDate}&format=xlsx`);
}

function initDeptChart() {
  if (!deptChartRef.value) return;
  deptChart = echarts.init(deptChartRef.value);
  deptChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['正常', '异常'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['技术部', '市场部', '运营部', '人事部', '财务部'] },
    yAxis: { type: 'value' },
    series: [
      { name: '正常', type: 'bar', data: [45, 30, 25, 15, 12], itemStyle: { color: '#52c41a' } },
      { name: '异常', type: 'bar', data: [5, 3, 2, 1, 1], itemStyle: { color: '#ff4d4f' } },
    ],
  });
}

function initTrendChart() {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);

  const months = Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, 'month').format('MM月'));

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['出勤率', '迟到率', '缺勤率'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: '出勤率', type: 'line', data: [98, 95, 97, 96, 98, 97], smooth: true },
      { name: '迟到率', type: 'line', data: [2, 3, 2, 3, 1, 2], smooth: true },
      { name: '缺勤率', type: 'line', data: [0.5, 1, 0.5, 0.5, 0.5, 0.5], smooth: true },
    ],
  });
}

function handleResize() {
  deptChart?.resize();
  trendChart?.resize();
}

onMounted(() => {
  stats.totalUsers = 156;
  stats.attendanceRate = 97;
  stats.lateRate = 2.5;
  stats.absentRate = 0.5;

  anomalyRanking.value = [
    { rank: 1, name: '张三', department: '技术部', lateCount: 12, earlyCount: 3 },
    { rank: 2, name: '李四', department: '市场部', lateCount: 10, earlyCount: 5 },
    { rank: 3, name: '王五', department: '运营部', lateCount: 8, earlyCount: 2 },
    { rank: 4, name: '赵六', department: '技术部', lateCount: 7, earlyCount: 4 },
    { rank: 5, name: '钱七', department: '人事部', lateCount: 6, earlyCount: 1 },
  ];

  initDeptChart();
  initTrendChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  deptChart?.dispose();
  trendChart?.dispose();
});
</script>

<style scoped>
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

.chart-container-large {
  height: 350px;
}
</style>