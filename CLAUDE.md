# CLAUDE.md — 项目协作提示词

本文件为 AI / 协作者在本仓库工作时的统一约定。修改代码前请先通读，确保产出与现有风格一致。

---

## 一、项目概览

- **定位**：用户管理（增删改查）单页应用，前端独立工程，对接 `../user-management` 的 FastAPI 服务。
- **技术栈**：Vue 3（`<script setup>` 组合式 API） + Vite 5 + Element Plus 2 + Axios。
- **语言环境**：中文 UI（Element Plus `zh-cn` 语言包），代码注释用中文。
- **目标浏览器**：现代浏览器（Chrome/Edge/Firefox/Safari 最新版），无需兼容 IE，可用原生 ESM 与现代语法。

### 目录结构（职责单一）

```
src/
├── main.js              # 应用入口：注册 Element Plus + 全局图标 + 全局样式
├── App.vue              # 布局外壳：侧边栏 + 顶部导航 + 内容区路由切换
├── assets/main.css      # 全局基础样式（reset、字体、背景）
├── api/
│   ├── request.js       # axios 实例 + 统一响应拦截器（唯一出口）
│   └── user.js          # 用户 CRUD 接口封装（带 JSDoc）
├── utils/
│   └── validators.js    # 纯函数校验 + Element Plus 校验器
└── views/
    └── UserManage.vue   # 用户管理主页面
```

**分层原则**：`views`（页面/交互） → `api`（接口封装） → `request`（HTTP 与拦截）。视图层不直接调用 `axios`，一律走 `api/*.js`。

---

## 二、编码规范（与现有代码保持一致）

### 命名
- **JS 变量 / 函数**：`camelCase`（`fetchData`、`handleSubmit`、`dialogVisible`）。
- **模块级常量**：`UPPER_SNAKE_CASE`（`GENDER_OPTIONS`、`OPERATOR`、`API_TARGET`）。
- **事件处理函数**：统一 `handleXxx` 前缀；打开弹窗用 `openXxx`。
- **后端交互字段**：保持后端 `snake_case`（`page_size`、`id_card`、`create_by`），不要在传参时改成驼峰。
- **CSS 类名**：BEM 风格（`sidebar__brand`、`app-header__right`、`is-collapsed` 表状态）。

### Vue 写法
- 一律使用 `<script setup>`，顺序为 `script` → `template` → `style scoped`。
- 列表/简单状态用 `ref`，表单等对象用 `reactive`；表单初始值用工厂函数（见 `defaultForm()`）便于重置。
- 注释用 `// ---------- 分区名 ----------` 对逻辑分块（常量 / 列表查询 / 弹窗 / 删除）。
- 模板中用 `<!-- 区块说明 -->` 标注区域。
- 样式必须 `scoped`；穿透 Element Plus 内部样式用 `:deep()`。

### 接口封装
- 每个接口一个导出函数，**必须写 JSDoc**（参数与返回结构），参考 `api/user.js`。
- 路径相对 `request` 的 `baseURL`（`/api`），即写 `/v1/users` 而非完整 URL。

### 校验
- 校验规则集中在 `utils/validators.js`，**必须与后端 `app/utils/validators.py` 保持一致**（手机号、身份证含校验位）。
- 同时导出纯函数（`isValidPhone`）与 Element Plus 校验器（`phoneRule`），便于复用。

---

## 三、关键约定（改动前务必遵守）

1. **统一响应**：后端返回 `{ code, message, data }`。`request.js` 拦截器中 `code === 0` 视为成功并返回 `data`，否则自动 `ElMessage.error` 弹错。
   - 因此**视图层 `catch` 块通常留空**（错误已统一提示），不要重复弹错。
2. **跨域**：后端未启用 CORS，开发环境靠 `vite.config.js` 的 `/api` 代理转发到 `http://127.0.0.1:9001`。新增接口前缀也走 `/api`。
3. **更新语义**：编辑用户为「仅提交变更字段」（后端 `UserUpdate`），保持这一行为。
4. **逻辑删除**：删除为逻辑删除，且删除当前页最后一条时需回退一页（见 `handleDelete`）。
5. **操作人**：`OPERATOR` 当前为演示常量 `'admin'`，真实接入登录态时从此处替换。
6. **新增模块**：在 `App.vue` 的 `MENUS` 追加菜单项 + `<main>` 中映射对应组件即可（已预留注释示例）。

---

## 四、常用命令

```bash
npm install     # 安装依赖（首次）
npm run dev     # 开发服务器，默认 http://localhost:5173，自动打开浏览器
npm run build   # 生产构建，产物输出到 dist/
npm run preview # 本地预览构建产物
```

> 调试需后端先启动：`cd ../user-management && python app/main.py`（默认 `0.0.0.0:9001`）。

---

## 五、工作准则（大厂规范要点）

- **最小改动**：只改与任务相关的代码，不顺手重构、不调整无关格式。
- **复用优先**：新逻辑先看 `api/`、`utils/` 是否已有可复用项；新增可复用逻辑下沉到对应层，不要堆在视图里。
- **风格自洽**：新代码的注释密度、命名、缩进必须与所在文件一致。本项目缩进 2 空格、无分号风格的 import、字符串用单引号。
- **不引入新依赖**：除非任务明确需要；优先用 Vue / Element Plus / Axios 已有能力。
- **可访问性与体验**：保留加载态（`v-loading` / `:loading`）、空数据提示（`el-empty`）、二次确认（`ElMessageBox.confirm`）、表单校验等已有体验细节。
- **安全**：不在前端硬编码密钥；用户输入在提交前 `trim()` 并经校验。
- **提交**：未经用户要求不擅自 `git commit` / `push`；提交信息用中文、说明「做了什么 + 为什么」。
- **不臆造后端字段**：接口字段以后端 `app/schemas/user.py` 与 `app/api/user.py` 为准，拿不准时先确认再写。
