import request from '@/utils/request'

// 获取轮播图列表
export function getBannerList() {
  return request({
    url: '/api/admin/banner/list',
    method: 'get'
  })
}

// 添加轮播图
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
    url: `/api/admin/banner/delete/${id}`,
    method: 'delete'
  })
}

// 更新轮播图状态
export function updateBannerStatus(data) {
  return request({
    url: '/api/admin/banner/status',
    method: 'post',
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