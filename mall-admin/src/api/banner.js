import request from '@/utils/request'

// 获取轮播图列表
export function getBannerList(params) {
  return request({
    url: '/api/admin/banner/list',
    method: 'get',
    params
  })
}

// 新增轮播图
export function addBanner(data) {
  return request({
    url: '/api/admin/banner/add',
    method: 'post',
    data
  })
}

// 更新轮播图
export function updateBanner(data) {
  return request({
    url: '/api/admin/banner/update',
    method: 'put',
    data
  })
}

// 删除轮播图
export function deleteBanner(id) {
  return request({
    url: '/api/admin/banner/delete',
    method: 'delete',
    params: { id }
  })
}

// 修改轮播图状态
export function updateBannerStatus(data) {
  return request({
    url: '/api/admin/banner/status',
    method: 'put',
    data
  })
}

// 修改轮播图排序
export function updateBannerSort(data) {
  return request({
    url: '/api/admin/banner/sort',
    method: 'put',
    data
  })
}

export function getBanners() {
  return request({
    url: '/banners',
    method: 'get'
  })
} 