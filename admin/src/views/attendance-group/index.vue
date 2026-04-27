<template>
  <div class="attendance-group">
    <div class="page-header">
      <h1 class="page-title">考勤组管理</h1>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建考勤组
      </el-button>
    </div>

    <div class="card-container">
      <el-table :data="groups" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="考勤组名称" />
        <el-table-column prop="workDays" label="工作日" width="120">
          <template #default="{ row }">
            {{ formatWorkDays(row.workDays) }}
          </template>
        </el-table-column>
        <el-table-column prop="lateGrace" label="迟到容忍(分钟)" width="140" />
        <el-table-column prop="maxPatchCard" label="月补卡上限" width="120" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑考勤组' : '新建考勤组'" width="600px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="考勤组名称">
          <el-input v-model="form.name" placeholder="请输入考勤组名称" />
        </el-form-item>
        <el-form-item label="工作日">
          <el-checkbox-group v-model="form.workDaysList">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="弹性打卡">
          <el-switch v-model="form.flexTime" />
        </el-form-item>
        <el-form-item label="迟到容忍(分钟)">
          <el-input-number v-model="form.lateGrace" :min="0" :max="60" />
        </el-form-item>
        <el-form-item label="早退容忍(分钟)">
          <el-input-number v-model="form.earlyGrace" :min="0" :max="60" />
        </el-form-item>
        <el-form-item label="月补卡上限">
          <el-input-number v-model="form.maxPatchCard" :min="0" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

const loading = ref(false);
const groups = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: 0,
  name: '',
  workDaysList: ['1', '2', '3', '4', '5'] as string[],
  flexTime: false,
  lateGrace: 5,
  earlyGrace: 5,
  maxPatchCard: 3,
});

async function loadGroups() {
  loading.value = true;
  try {
    groups.value = await request.get<any[]>('/schedule/groups');
  } catch (err) {
    console.error('Load groups failed:', err);
  } finally {
    loading.value = false;
  }
}

function handleCreate() {
  isEdit.value = false;
  Object.assign(form, {
    id: 0,
    name: '',
    workDaysList: ['1', '2', '3', '4', '5'],
    flexTime: false,
    lateGrace: 5,
    earlyGrace: 5,
    maxPatchCard: 3,
  });
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    workDaysList: row.workDays.split(','),
    flexTime: row.flexTime,
    lateGrace: row.lateGrace,
    earlyGrace: row.earlyGrace,
    maxPatchCard: row.maxPatchCard,
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  try {
    const data = {
      ...form,
      workDays: form.workDaysList.join(','),
    };
    if (isEdit.value) {
      await request.put(`/schedule/groups/${form.id}`, data);
      ElMessage.success('更新成功');
    } else {
      await request.post('/schedule/groups', data);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadGroups();
  } catch (err) {
    ElMessage.error('操作失败');
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该考勤组？', '提示', {
      type: 'warning',
    });
    await request.delete(`/schedule/groups/${row.id}`);
    ElMessage.success('删除成功');
    loadGroups();
  } catch (err) {
    // User cancelled
  }
}

function formatWorkDays(days: string) {
  const dayMap: Record<string, string> = {
    '0': '周日', '1': '周一', '2': '周二', '3': '周三',
    '4': '周四', '5': '周五', '6': '周六',
  };
  return days.split(',').map((d) => dayMap[d] || d).join(',');
}

onMounted(() => {
  loadGroups();
});
</script>