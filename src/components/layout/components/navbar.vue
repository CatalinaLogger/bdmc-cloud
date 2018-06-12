<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>

    <breadcrumb class="breadcrumb-container"></breadcrumb>

    <div class="right-menu">

      <el-tooltip effect="dark" :content="$t('navbar.screenFull')" placement="bottom">
        <div class="screen-full">
          <screen-full></screen-full>
        </div>
      </el-tooltip>

      <el-tooltip effect="dark" content="退出" placement="bottom">
        <div class="login-out" @click="logout">
          <svg-icon icon-class="out"/>
        </div>
      </el-tooltip>

    </div>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from 'base/breadcrumb'
import Hamburger from 'base/hamburger'
import ErrorLog from 'base/error-log'
import ScreenFull from 'base/screen-full'
import LangSelect from 'base/lang-select'
import ThemePicker from 'base/theme-picker'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    ScreenFull,
    LangSelect,
    ThemePicker
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.navbar
  height 50px
  line-height 50px
  border-radius 0px !important
  .hamburger-container
    line-height 58px
    height 50px
    float left
    padding 0 10px
  .breadcrumb-container
    float left
  .errLog-container
    display inline-block
    vertical-align top
  .right-menu
    display flex
    float right
    height 100%
    .screen-full
      padding-top 5px
    .login-out
      margin 5px 15px
      padding 0 5px
      color white
      cursor pointer
      font-size 30px
      line-height 40px
      background #409eff
      border-radius 5px
      &:hover
        background #606266
</style>
