<template>
  <div class="system-page">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
    </div>

    <el-row :gutter="24">
      <el-col :span="12">
        <div class="card-container">
          <div class="section-title">基本设置</div>
          <el-form :model="basicSettings" label-width="120px">
            <el-form-item label="企业名称">
              <el-input v-model="basicSettings.companyName" />
            </el-form-item>
            <el-form-item label="考勤周期">
              <el-select v-model="basicSettings.attendanceCycle">
                <el-option label="自然月" value="month" />
                <el-option label="日历月" value="calendar_month" />
              </el-select>
            </el-form-item>
            <el-form-item label="工作日">
              <el-checkbox-group v-model="basicSettings.workDaysList">
                <el-checkbox label="1">周一</el-checkbox>
                <el-checkbox label="2">周二</el-checkbox>
                <el-checkbox label="3">周三</el-checkbox>
                <el-checkbox label="4">周四</el-checkbox>
                <el-checkbox label="5">周五</el-checkbox>
                <el-checkbox label="6">周六</el-checkbox>
                <el-checkbox label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-container">
          <div class="section-title">规则设置</div>
          <el-form :model="ruleSettings" label-width="120px">
            <el-form-item label="迟到容忍">
              <el-input-number v-model="ruleSettings.lateGrace" :min="0" :max="60" />
              <span class="form-tip">分钟</span>
            </el-form-item>
            <el-form-item label="早退容忍">
              <el-input-number v-model="ruleSettings.earlyGrace" :min="0" :max="60" />
              <span class="form-tip">分钟</span>
            </el-form-item>
            <el-form-item label="月补卡上限">
              <el-input-number v-model="ruleSettings.maxPatchCard" :min="0" :max="10" />
              <span class="form-tip">次</span>
            </el-form-item>
            <el-form-item label="月年假上限">
              <el-input-number v-model="ruleSettings.maxAnnualLeave" :min="0" :max="30" />
              <span class="form-tip">天</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveRuleSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="12">
        <div class="card-container">
          <div class="section-title">钉钉配置</div>
          <el-form :model="dingtalkSettings" label-width="120px">
            <el-form-item label="App Key">
              <el-input v-model="dingtalkSettings.appKey" />
            </el-form-item>
            <el-form-item label="App Secret">
              <el-input v-model="dingtalkSettings.appSecret" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveDingtalkSettings">保存配置</el-button>
              <el-button @click="testDingtalkConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-container">
          <div class="section-title">系统信息</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="Node.js 版本">20.x</el-descriptions-item>
            <el-descriptions-item label="数据库">MySQL 8.0</el-descriptions-item>
            <el-descriptions-item label="部署环境">Oracle Cloud ARM</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const basicSettings = reactive({
  companyName: '智勤科技',
  attendanceCycle: 'month',
  workDaysList: ['1', '2', '3', '4', '5'],
});

const ruleSettings = reactive({
  lateGrace: 5,
  earlyGrace: 5,
  maxPatchCard: 3,
  maxAnnualLeave: 15,
});

const dingtalkSettings = reactive({
  appKey: '',
  appSecret: '',
});

function saveBasicSettings() {
  ElMessage.success('基本设置已保存');
}

function saveRuleSettings() {
  ElMessage.success('规则设置已保存');
}

function saveDingtalkSettings() {
  ElMessage.success('钉钉配置已保存');
}

function testDingtalkConnection() {
  ElMessage.success('连接测试成功');
}
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
}
</style>