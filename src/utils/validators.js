// 前端字段校验，规则与后端 app/utils/validators.py 保持一致

// 中国大陆手机号：1 开头，第二位 3-9，共 11 位
const PHONE_PATTERN = /^1[3-9]\d{9}$/

// 18 位身份证号：17 位数字 + 1 位校验码（数字或 X）
const ID_CARD_PATTERN = /^\d{17}[\dXx]$/

// 身份证加权因子与校验码映射
const ID_CARD_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const ID_CARD_CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

export function isValidPhone(phone) {
  return PHONE_PATTERN.test((phone || '').trim())
}

export function isValidIdCard(idCard) {
  const value = (idCard || '').trim().toUpperCase()
  if (!ID_CARD_PATTERN.test(value)) return false
  let total = 0
  for (let i = 0; i < 17; i++) {
    total += Number(value[i]) * ID_CARD_WEIGHTS[i]
  }
  return value[17] === ID_CARD_CHECK_CODES[total % 11]
}

// Element Plus 表单校验器
export const phoneRule = (_rule, value, callback) => {
  if (!value) return callback(new Error('请输入手机号'))
  if (!isValidPhone(value)) return callback(new Error('手机号格式不正确'))
  callback()
}

export const idCardRule = (_rule, value, callback) => {
  if (!value) return callback(new Error('请输入身份证号'))
  if (!isValidIdCard(value)) return callback(new Error('身份证号格式或校验位不正确'))
  callback()
}
