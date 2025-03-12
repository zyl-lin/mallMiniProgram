import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/components/Layout'
import { getToken } from '@/utils/auth'
import store from '@/store'

Vue.use(Router)

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/list',
    name: 'Goods',
    meta: { title: '商品管理', icon: 'goods' },
    children: [
      {
        path: 'list',
        component: () => import('@/views/goods/list'),
        name: 'GoodsList',
        meta: { title: '商品列表' }
      },
      {
        path: 'edit/:id?',
        component: () => import('@/views/goods/edit'),
        name: 'GoodsEdit',
        meta: { title: '编辑商品' },
        hidden: true
      },
      {
        path: 'category',
        component: () => import('@/views/goods/category'),
        name: 'Category',
        meta: { title: '商品分类' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/views/order/list'),
        name: 'OrderList',
        meta: { title: '订单列表', icon: 'order' }
      }
    ]
  },
  {
    path: '/banner',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/banner/index'),
        name: 'Banner',
        meta: { title: '轮播图管理', icon: 'el-icon-picture' }
      }
    ],
    redirect: '/banner/index'
  },
  {
    path: '/statistics',
    component: Layout,
    name: 'Statistics',
    meta: { title: '数据统计', icon: 'chart' },
    children: [
      {
        path: 'sales',
        component: () => import('@/views/statistics/sales'),
        name: 'SalesStats',
        meta: { title: '销售统计' }
      },
      {
        path: 'orders',
        component: () => import('@/views/statistics/orders'),
        name: 'OrderStats',
        meta: { title: '订单统计' }
      }
    ]
  }
]

// 白名单路由
const whiteList = ['/login']

const router = new Router({
  routes: constantRoutes
})

// 全局前置守卫
router.beforeEach(async(to, from, next) => {
  console.log('路由跳转:', from.path, '->', to.path)
  // 获取token
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      console.log('已登录，重定向到首页')
      // 已登录且要跳转登录页，重定向到首页
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        console.log('用户信息已存在，直接跳转')
        next()
      } else {
        try {
          console.log('获取用户信息')
          // 获取用户信息
          await store.dispatch('user/getInfo')
          next()
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 获取用户信息失败，清除token并跳转登录页
          await store.dispatch('user/logout')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('访问白名单路由')
      // 白名单中的路由直接放行
      next()
    } else {
      console.log('未登录，重定向到登录页')
      // 没有token，重定向到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router 