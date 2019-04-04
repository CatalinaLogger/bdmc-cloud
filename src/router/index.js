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

  { path: '/centre', component: _import('system/centre/index'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: '/map'
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'map',
        name: 'map',
        component: _import('map1/index'),
        meta: { title: 'map', icon: 'map', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'video',
        name: 'video',
        component: _import('image/index'),
        meta: { title: 'video', icon: 'video', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'warn',
        name: 'alarms',
        component: _import('warn/index'),
        meta: { title: 'alarms', icon: 'warning', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'report',
        name: 'report',
        component: _import('report/index'),
        meta: { title: 'report', icon: 'report', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'device',
        name: 'devices',
        component: _import('device/index'),
        meta: { title: 'devices', icon: 'device', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'user',
        name: 'users',
        component: _import('system/users/index'),
        meta: { title: 'users', icon: 'user-setting', noCache: true }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'centre',
        name: 'centre',
        component: _import('system/centre/index')
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    children: [
      { path: '/401', component: _import('error-page/401'), hidden: true }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
