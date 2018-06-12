import Vue from 'vue'
import Router from 'vue-router'
import Layout from 'components/layout/layout'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/404', component: _import('error-page/404'), hidden: true },
  { path: '/401', component: _import('error-page/401'), hidden: true },
  { path: '/centre', component: _import('system/centre/index'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: '/monitor/index'
  },
  {
    path: '/monitor',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'monitor',
        component: _import('monitor/index'),
        meta: { title: 'monitor', icon: 'map', noCache: true }
      }
    ]
  },
  {
    path: '/video',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'video',
        component: _import('video/index'),
        meta: { title: 'video', icon: 'video', noCache: true }
      }
    ]
  },
  {
    path: '/devices',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'devices',
        component: _import('devices/index'),
        meta: { title: 'devices', icon: 'device', noCache: true }
      }
    ]
  },
  {
    path: '/alarms',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'alarms',
        component: _import('alarms/index'),
        meta: { title: 'alarms', icon: 'warning', noCache: true }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'users',
        component: _import('system/users/index'),
        meta: { title: 'users', icon: 'user-setting', noCache: true }
      }
    ]
  },
  {
    path: '/centre',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        name: 'centre',
        component: _import('system/centre/index')
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
