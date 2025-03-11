import request from '@/utils/request'

// 获取商品列表
export function getGoodsList(params) {
  return request({
    url: '/admin/goods/list',
    method: 'get',
    params
  })
}

// 新增商品
export function addGoods(data) {
  return request({
    url: '/admin/goods/add',
    method: 'post',
    data
  })
}

// 更新商品
export function updateGoods(data) {
  return request({
    url: '/admin/goods/update',
    method: 'put',
    data
  })
}

// 删除商品
export function deleteGoods(id) {
  return request({
    url: `/admin/goods/delete/${id}`,
    method: 'delete'
  })
}

// 修改商品状态
export function changeGoodsStatus(data) {
  return request({
    url: '/admin/goods/status',
    method: 'put',
    data
  })
}

// 获取商品分类列表
export function getCategoryList(params) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  })
}

// 新增商品分类
export function addCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

// 更新商品分类
export function updateCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'put',
    data
  })
}

// 删除商品分类
export function deleteCategory(id) {
  return request({
    url: `/admin/category/delete/${id}`,
    method: 'delete'
  })
}

export function getGoodsDetail(id) {
  return request({
    url: `/goods/detail/${id}`,
    method: 'get'
  })
}

export function createGoods(data) {
  return request({
    url: '/goods/create',
    method: 'post',
    data
  })
} 