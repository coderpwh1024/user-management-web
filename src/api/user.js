import request from './request'

// 用户管理接口，对接后端 app/api/user.py
// 路由前缀：/api/v1/users

/**
 * 分页查询用户
 * @param {{page:number, page_size:number, name?:string, phone?:string}} params
 * @returns {Promise<{total:number,page:number,page_size:number,items:Array}>}
 */
export function listUsers(params) {
  return request.get('/v1/users', { params })
}

/**
 * 查询用户详情
 * @param {number} id
 */
export function getUser(id) {
  return request.get(`/v1/users/${id}`)
}

/**
 * 创建用户
 * @param {object} data
 */
export function createUser(data) {
  return request.post('/v1/users', data)
}

/**
 * 更新用户（仅更新传入字段）
 * @param {number} id
 * @param {object} data
 */
export function updateUser(id, data) {
  return request.put(`/v1/users/${id}`, data)
}

/**
 * 删除用户（逻辑删除）
 * @param {number} id
 */
export function deleteUser(id) {
  return request.delete(`/v1/users/${id}`)
}
