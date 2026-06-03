# 用户管理系统（前端）

基于 **Vue 3 + Vite + Element Plus** 实现的用户管理（增删改查）单页应用，
对接 [`user-management`](../user-management) FastAPI 后端服务。

页面简洁美观，针对 Chrome 等现代浏览器优化。

---

## 一、功能特性

| 功能 | 说明 |
| ---- | ---- |
| 用户列表 | 表格展示，支持斑马纹、边框、加载态、空数据提示 |
| 分页查询 | 支持页码、每页条数（10/20/50/100）切换 |
| 条件检索 | 按「姓名（模糊）」「手机号（精确）」组合查询 |
| 新增用户 | 弹窗表单，含前端校验 |
| 编辑用户 | 仅提交变更字段，复用同一弹窗 |
| 删除用户 | 二次确认后逻辑删除 |
| 表单校验 | 手机号、身份证号规则与后端 `app/utils/validators.py` 完全一致 |
| 统一响应 | 自动解构后端 `{ code, message, data }` 结构并统一错误提示 |

---

## 二、技术栈

- **Vue 3**（`<script setup>` 组合式 API）
- **Vite 5**（开发服务器 / 构建）
- **Element Plus**（UI 组件库，含中文语言包与图标）
- **Axios**（HTTP 请求，封装统一拦截器）

---

## 三、目录结构

```
user-management-web/
├── index.html                # HTML 入口
├── package.json              # 依赖与脚本
├── vite.config.js            # Vite 配置（含后端代理）
├── README.md                 # 本文档
└── src/
    ├── main.js               # 应用入口，注册 Element Plus
    ├── App.vue               # 布局外壳（顶部导航）
    ├── assets/
    │   └── main.css          # 全局样式
    ├── api/
    │   ├── request.js        # axios 实例 + 响应拦截器
    │   └── user.js           # 用户 CRUD 接口封装
    ├── utils/
    │   └── validators.js     # 手机号 / 身份证号前端校验
    └── views/
        └── UserManage.vue    # 用户管理主页面
```

---

## 四、接口对接说明

接口来源：后端 `user-management/app/api/user.py`
服务地址：参考 `user-management/app/core/config.py` → `app_host: 0.0.0.0`，`app_port: 9001`

| 操作 | 方法 | 路径 | 说明 |
| ---- | ---- | ---- | ---- |
| 创建用户 | `POST` | `/api/v1/users` | 请求体 `UserCreate` |
| 用户详情 | `GET` | `/api/v1/users/{id}` | - |
| 分页查询 | `GET` | `/api/v1/users?page=&page_size=&name=&phone=` | `name` 模糊、`phone` 精确 |
| 更新用户 | `PUT` | `/api/v1/users/{id}` | 请求体 `UserUpdate`，仅更新传入字段 |
| 删除用户 | `DELETE` | `/api/v1/users/{id}` | 逻辑删除 |

**统一响应结构**（`app/core/response.py`）：

```json
{ "code": 0, "message": "success", "data": { } }
```

- `code === 0` 视为成功，拦截器返回 `data`；
- `code !== 0` 自动弹出 `message` 错误提示。

**用户字段**（`app/schemas/user.py`）：

| 字段 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| `name` | string | 是 | 姓名，1~64 字符 |
| `age` | int | 否 | 年龄，0~150 |
| `phone` | string | 是 | 手机号，`^1[3-9]\d{9}$` |
| `id_card` | string | 是 | 18 位身份证号，含校验位 |
| `gender` | int | 否 | 0 未知 / 1 男 / 2 女，默认 0 |
| `create_by` / `update_by` | string | 否 | 操作人 |

---

## 五、跨域处理

后端当前**未启用 CORS**，因此开发环境通过 **Vite 代理**转发请求，避免跨域：

```js
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:9001', changeOrigin: true }
  }
}
```

前端所有请求 `baseURL` 为 `/api`，由 Vite 代理到后端 `9001` 端口。

> 若需脱离代理直连（如生产部署），请在后端 `app/main.py` 中追加
> `CORSMiddleware`，或由 Nginx 统一反向代理前后端。

---

## 六、快速开始

### 1. 启动后端服务

```bash
cd ../user-management
# 安装依赖（首次）
pip install -r requirements.txt
# 启动（默认 0.0.0.0:9001）
python app/main.py
```

### 2. 启动前端

```bash
cd user-management-web

# 安装依赖（首次）
npm install

# 启动开发服务器（默认 http://localhost:5173 并自动打开浏览器）
npm run dev
```

### 3. 生产构建

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

---

## 七、自定义配置

- **修改后端地址**：编辑 `vite.config.js` 中的 `API_TARGET`。
- **修改前端端口**：编辑 `vite.config.js` 中 `server.port`。
- **修改操作人**：编辑 `src/views/UserManage.vue` 中的 `OPERATOR` 常量
  （真实项目可从登录态获取）。

---

## 八、浏览器兼容

面向现代浏览器（Chrome / Edge / Firefox / Safari 最新版）。
Vite 默认构建目标为支持原生 ESM 的浏览器，Chrome 完整兼容。
