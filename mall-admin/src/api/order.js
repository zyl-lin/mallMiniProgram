import request from '@/utils/request'

// 获取订单列表
export function getOrders(params) {
  return request({
    url: '/api/admin/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: '/api/admin/order/detail',
    method: 'get',
    params: { id }
  })
}

// 修改订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/api/admin/order/status',
    method: 'put',
    data
  })
}

// 订单发货
export function shipOrder(data) {
  return request({
    url: '/api/admin/order/ship',
    method: 'post',
    data
  })
}

// 订单备注
export function remarkOrder(data) {
  return request({
    url: '/admin/order/remark',
    method: 'put',
    data
  })
} 