<template>
  <div class="shifts-page">
    <div class="page-header">
      <h1 class="page-title">班次管理</h1>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建班次
      </el-button>
    </div>

    <div class="card-container">
      <el-table :data="shifts" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="班次名称" />
        <el-table-column prop="startTime" label="上班时间" width="100" />
        <el-table-column prop="endTime" label="下班时间" width="100" />
        <el-table-column prop="restStartTime" label="午休开始" width="100" />
        <el-table-column prop="restEndTime" label="午休结束" width="100" />
        <el-table-column prop="color" label="颜色" width="100">
          <template #default="{ row }">
            <div class="color-dot" :style="{ backgroundColor: row.color }"></div>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班次' : '新建班次'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="班次名称">
          <el-input v-model="form.name" placeholder="如：早班、中班、晚班" />
        </el-form-item>
        <el-form-item label="上班时间">
          <el-time-picker v-model="form.startTime" format="HH:mm" value-format="HH:mm" />
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker v-model="form.endTime" format="HH:mm" value-format="HH:mm" />
        </el-form-item>
        <el-form-item label="午休开始">
          <el-time-picker v-model="form.restStartTime" format="HH:mm" value-format="HH:mm" />
        </el-form-item>
        <el-form-item label="午休结束">
          <el-time-picker v-model="form.restEndTime" format="HH:mm" value-format="HH:mm" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" />
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
const shifts = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: 0,
  name: '',
  startTime: '09:00',
  endTime: '18:00',
  restStartTime: '12:00',
  restEndTime: '13:00',
  color: '#409EFF',
});

async function loadShifts() {
  loading.value = true;
  try {
    shifts.value = await request.get<any[]>('/schedule/shifts');
  } catch (err) {
    console.error('Load shifts failed:', err);
  } finally {
    loading.value = false;
  }
}

function handleCreate() {
  isEdit.value = false;
  Object.assign(form, {
    id: 0,
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    restStartTime: '12:00',
    restEndTime: '13:00',
    color: '#409EFF',
  });
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
}

async function handleSubmit() {
  try {
    if (isEdit.value) {
      await request.put(`/schedule/shifts/${form.id}`, form);
      ElMessage.success('更新成功');
    } else {
      await request.post('/schedule/shifts', form);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadShifts();
  } catch (err) {
    ElMessage.error('操作失败');
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该班次？', '提示', { type: 'warning' });
    await request.delete(`/schedule/shifts/${row.id}`);
    ElMessage.success('删除成功');
    loadShifts();
  } catch (err) {
    // User cancelled
  }
}

onMounted(() => {
  loadShifts();
});
</script>

<style scoped>
.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>