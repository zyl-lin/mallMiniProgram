import request from '@/utils/request'

// 获取轮播图列表
export function getBannerList(params) {
  return request({
    url: '/admin/banner/list',
    method: 'get',
    params
  })
}

// 新增轮播图
export function addBanner(data) {
  return request({
    url: '/banners',
    method: 'post',
    data
  })
}

// 更新轮播图
export function updateBanner(data) {
  return request({
    url: `/banners/${data.id}`,
    method: 'put',
    data
  })
}

// 删除轮播图
export function deleteBanner(id) {
  return request({
    url: `/banners/${id}`,
    method: 'delete'
  })
}

// 修改轮播图状态
export function changeBannerStatus(data) {
  return request({
    url: '/admin/banner/status',
    method: 'put',
    data
  })
}

// 修改轮播图排序
export function changeBannerSort(data) {
  return request({
    url: '/admin/banner/sort',
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