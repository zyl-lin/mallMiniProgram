import request from '@/utils/request'

// 获取订单列表
export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

// 修改订单状态
export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 订单发货
export function deliverOrder(data) {
  return request({
    url: '/admin/order/deliver',
    method: 'put',
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