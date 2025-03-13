import request from '@/utils/request'

// 获取商品列表
export function getGoodsList(params) {
  return request({
    url: '/api/admin/goods/list',
    method: 'get',
    params
  })
}

// 新增商品
export function addGoods(data) {
  return request({
    url: '/api/admin/goods/add',
    method: 'post',
    data
  })
}

// 更新商品
export function updateGoods(data) {
  return request({
    url: '/api/admin/goods/update',
    method: 'post',
    data
  })
}

// 删除商品
export function deleteGoods(id) {
  return request({
    url: '/api/admin/goods/delete',
    method: 'delete',
    params: { id }
  })
}

// 商品上下架
export function updateGoodsStatus(data) {
  return request({
    url: '/api/admin/goods/status',
    method: 'put',
    data
  })
}

// 批量上下架
export function batchUpdateStatus(data) {
  return request({
    url: '/api/admin/goods/batch-status',
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
    url: `/api/admin/goods/detail/${id}`,
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

// 更新商品推荐状态
export function updateGoodsRecommend(data) {
  return request({
    url: '/api/admin/goods/recommend',
    method: 'put',
    data
  })
}

// 批量更新推荐状态
export function batchUpdateRecommend(data) {
  return request({
    url: '/api/admin/goods/batch-recommend',
    method: 'put',
    data
  })
} 