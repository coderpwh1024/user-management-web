import axios from 'axios'
import { ElMessage } from 'element-plus'

// 统一 axios 实例
// baseURL 走 '/api'，开发环境由 Vite 代理转发到后端 http://127.0.0.1:9001
const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 响应拦截器：解构后端统一响应 { code, message, data }
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端约定 code === 0 为成功
    if (res && typeof res.code !== 'undefined') {
      if (res.code === 0) {
        return res.data
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    // HTTP 层错误（4xx / 5xx）
    const msg =
      error.response?.data?.message ||
      error.message ||
      '网络异常，请稍后重试'
    ElMessage.error(msg)
    return Promise.reject(error)
  },
)

export default service
