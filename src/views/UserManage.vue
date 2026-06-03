<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../api/user'
import { idCardRule, phoneRule } from '../utils/validators'

// ---------- 常量 ----------
const GENDER_OPTIONS = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]
const GENDER_MAP = { 0: '未知', 1: '男', 2: '女' }
const GENDER_TAG = { 0: 'info', 1: '', 2: 'danger' }
// 当前操作人（演示用，真实项目可从登录态获取）
const OPERATOR = 'admin'

// ---------- 列表 & 查询 ----------
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const query = reactive({
  name: '',
  phone: '',
  page: 1,
  page_size: 10,
})

async function fetchData() {
  loading.value = true
  try {
    const params = {
      page: query.page,
      page_size: query.page_size,
    }
    if (query.name) params.name = query.name.trim()
    if (query.phone) params.phone = query.phone.trim()
    const res = await listUsers(params)
    tableData.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    // 错误已在拦截器统一提示
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchData()
}

function handleReset() {
  query.name = ''
  query.phone = ''
  query.page = 1
  fetchData()
}

function handlePageChange(page) {
  query.page = page
  fetchData()
}

function handleSizeChange(size) {
  query.page_size = size
  query.page = 1
  fetchData()
}

// ---------- 新增 / 编辑 弹窗 ----------
const dialogVisible = ref(false)
const dialogMode = ref('create') // create | edit
const submitting = ref(false)
const formRef = ref()

const defaultForm = () => ({
  id: null,
  name: '',
  age: undefined,
  phone: '',
  id_card: '',
  gender: 0,
})
const form = reactive(defaultForm())

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 64, message: '姓名长度不能超过 64 个字符', trigger: 'blur' },
  ],
  age: [
    {
      type: 'number',
      min: 0,
      max: 150,
      message: '年龄需在 0 ~ 150 之间',
      trigger: 'blur',
    },
  ],
  phone: [{ required: true, validator: phoneRule, trigger: 'blur' }],
  id_card: [{ required: true, validator: idCardRule, trigger: 'blur' }],
}

function openCreate() {
  dialogMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  formRef.value?.clearValidate?.()
}

function openEdit(row) {
  dialogMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    age: row.age ?? undefined,
    phone: row.phone,
    id_card: row.id_card,
    gender: row.gender,
  })
  dialogVisible.value = true
  formRef.value?.clearValidate?.()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await createUser({
          name: form.name,
          age: form.age,
          phone: form.phone,
          id_card: form.id_card,
          gender: form.gender,
          create_by: OPERATOR,
        })
        ElMessage.success('创建成功')
      } else {
        await updateUser(form.id, {
          name: form.name,
          age: form.age,
          phone: form.phone,
          id_card: form.id_card,
          gender: form.gender,
          update_by: OPERATOR,
        })
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (e) {
      // 拦截器已提示
    } finally {
      submitting.value = false
    }
  })
}

// ---------- 删除 ----------
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${row.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return // 用户取消
  }
  try {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    // 删除当前页最后一条时回退一页
    if (tableData.value.length === 1 && query.page > 1) {
      query.page -= 1
    }
    fetchData()
  } catch (e) {
    // 拦截器已提示
  }
}

function formatDateTime(val) {
  if (!val) return '-'
  return val.replace('T', ' ').slice(0, 19)
}

onMounted(fetchData)
</script>

<template>
  <div class="user-manage">
    <!-- 查询区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="姓名">
          <el-input
            v-model="query.name"
            placeholder="姓名（模糊匹配）"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="query.phone"
            placeholder="手机号（精确匹配）"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="'Refresh'" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <span class="table-title">用户列表</span>
        <el-button type="primary" :icon="'Plus'" @click="openCreate">
          新增用户
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#1f2329' }"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="age" label="年龄" width="80" align="center">
          <template #default="{ row }">{{ row.age ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="性别" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="GENDER_TAG[row.gender]" effect="light" size="small">
              {{ GENDER_MAP[row.gender] ?? '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="id_card" label="身份证号" min-width="190" />
        <el-table-column prop="create_by" label="创建人" width="100">
          <template #default="{ row }">{{ row.create_by ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.create_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="'Edit'"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              :icon="'Delete'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="query.page"
          :page-size="query.page_size"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
      width="520px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        status-icon
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio
              v-for="opt in GENDER_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="form.age"
            :min="0"
            :max="150"
            controls-position="right"
            placeholder="请输入年龄"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入 11 位手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="id_card">
          <el-input
            v-model="form.id_card"
            placeholder="请输入 18 位身份证号"
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

:deep(.el-card__body) {
  padding: 18px 20px;
}
</style>
