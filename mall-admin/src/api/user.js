import request from '@/utils/request'

// 管理员登录
export function login(data) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}

// 管理员退出
export function logout() {
  return request({
    url: '/api/admin/logout',
    method: 'post'
  })
}

// 获取管理员信息
export function getInfo() {
  return request({
    url: '/api/admin/info',
    method: 'get'
  })
} 