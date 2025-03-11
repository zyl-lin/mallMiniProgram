import request from '@/utils/request'

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: `/categories/${data.id}`,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
} 