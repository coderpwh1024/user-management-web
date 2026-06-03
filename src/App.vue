<script setup>
import { computed, ref } from 'vue'
import UserManage from './views/UserManage.vue'

// 左侧菜单（后续新增模块只需在此追加一项 + 在 <main> 中映射组件）
const MENUS = [
  { key: 'user', label: '用户管理', icon: 'User' },
  // { key: 'machine', label: '设备管理', icon: 'Monitor' },
]

const activeMenu = ref('user')
const collapsed = ref(false)

const currentLabel = computed(
  () => MENUS.find((m) => m.key === activeMenu.value)?.label ?? '',
)
</script>

<template>
  <div class="layout">
    <!-- 左侧导航 -->
    <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
      <div class="sidebar__brand">
        <el-icon :size="24"><Platform /></el-icon>
        <span v-show="!collapsed" class="sidebar__brand-text">管理系统</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        class="sidebar__menu"
        background-color="#1f2d3d"
        text-color="#c0c4cc"
        active-text-color="#fff"
        @select="activeMenu = $event"
      >
        <el-menu-item v-for="m in MENUS" :key="m.key" :index="m.key">
          <el-icon><component :is="m.icon" /></el-icon>
          <template #title>{{ m.label }}</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧主体 -->
    <div class="main-wrapper">
      <header class="app-header">
        <el-icon
          class="app-header__collapse"
          :size="20"
          @click="collapsed = !collapsed"
        >
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
        <el-breadcrumb separator="/" class="app-header__breadcrumb">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentLabel }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="app-header__right">
          <el-icon :size="18"><UserFilled /></el-icon>
          <span>admin</span>
        </div>
      </header>

      <main class="app-main">
        <UserManage v-if="activeMenu === 'user'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
}

/* ---------- 侧边栏 ---------- */
.sidebar {
  width: 220px;
  background: #1f2d3d;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.sidebar.is-collapsed {
  width: 64px;
}

.sidebar__brand {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  color: #fff;
  background: #18222e;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar__brand-text {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar__menu {
  flex: 1;
  border-right: none;
}

/* 未折叠时固定宽度，避免菜单抖动 */
.sidebar__menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar__menu :deep(.el-menu-item.is-active) {
  background: #2563eb;
}

/* ---------- 主体 ---------- */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.app-header__collapse {
  cursor: pointer;
  color: #5f6772;
}

.app-header__collapse:hover {
  color: #2563eb;
}

.app-header__breadcrumb {
  flex: 1;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5f6772;
  font-size: 14px;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
