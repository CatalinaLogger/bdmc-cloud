<template>
<div class="app-wrapper">
  <div class="header-bar">
    <el-menu
      router
      :default-active="activeIndex"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="yellow">
      <el-menu-item index="/map">监测站点</el-menu-item>
      <el-menu-item index="/video">监控图像</el-menu-item>
      <el-menu-item index="/warn">预警信息</el-menu-item>
      <el-menu-item index="/report">数据监控</el-menu-item>
      <el-menu-item index="/user" v-if="me.type === 1">用户管理</el-menu-item>
    </el-menu>
    <div class="right">
      <div class="info">
        <div class="project">{{me.project.name}}</div>
        <div class="user">{{me.name}}</div>
      </div>
      <el-tooltip effect="dark" content="退出" placement="bottom">
        <div class="out" @click="logout">
          <svg-icon icon-class="out"/>
        </div>
      </el-tooltip>
    </div>
  </div>
  <app-main></app-main>
</div>
</template>

<script type="text/ecmascript-6">
import AppMain from './appmain'
import { mapGetters } from 'vuex'

export default {
  name: 'layout',
  data() {
    return {
      activeIndex: '/map'
    }
  },
  mounted() {
    this.activeIndex = this.$route.path
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    ...mapGetters([
      'me'
    ])
  },
  methods: {
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  },
  components: {
    AppMain
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.app-wrapper
  height 100%
  width 100%
  .header-bar
    position relative
    height 50px
    background #545c64
    .right
      position absolute
      top 0
      right 0
      display flex
      height 50px
      .info
        padding-top 12px
        color white
        .project
          padding-right 10px
          height 13px
          color #F2F6FC
          font-size 13px
          border-right 1px solid #ccc
        .user
          padding-right 10px
          color #C0C4CC
          font-size 12px
          border-right 1px solid #ccc
      .out
        width 50px
        height 50px
        color white
        text-align center
        padding-top 8px
        font-size 30px
        cursor pointer
        &:hover
          color yellow
          background rgb(67, 74, 80)
</style>
