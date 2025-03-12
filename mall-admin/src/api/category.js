import request from '@/utils/request'

// 获取分类列表
export function getCategories() {
  return request({
    url: '/api/admin/category/list',
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/api/admin/category/add',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(data) {
  return request({
    url: '/api/admin/category/update',
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: '/api/admin/category/delete',
    method: 'delete',
    params: { id }
  })
}

// 修改分类状态
export function updateCategoryStatus(data) {
  return request({
    url: '/api/admin/category/status',
    method: 'put',
    data
  })
}

// 修改分类排序
export function updateCategorySort(data) {
  return request({
    url: '/api/admin/category/sort',
    method: 'put',
    data
  })
} 