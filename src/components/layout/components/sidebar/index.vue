<template>
  <div>
    <div class="logo" >
      <img src="./logo.png">
    </div>
    <scroll-bar>
      <el-menu mode="vertical" :default-active="$route.path" :collapse="isCollapse" background-color="#304156" text-color="#fff" active-text-color="#409eff">
        <sidebar-item :routes="routes"></sidebar-item>
      </el-menu>
    </scroll-bar>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import SidebarItem from './item'
import ScrollBar from 'base/scroll-bar'

export default {
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  components: { SidebarItem, ScrollBar }
}
</script>
