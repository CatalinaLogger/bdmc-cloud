import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import VueAMap from 'vue-amap'
import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import i18n from 'common/lang' // Internationalization
import 'common/stylus/index.styl'
import 'common/icons' // icon
import '@/permission' // permission control
// import './mock' // simulation data

Vue.use(ElementUI, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: '1d34df1dae311ab7a6c911b8acd68cef',
  plugin: ['AMap.ToolBar', 'AMap.MapType'],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.6',
  uiVersion: '1.0.11'
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  render: h => h(App)
})
