<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index)  in levelList" :key="item.path" v-if="item.meta.title">
        <span v-if="item.redirect==='no'||index==levelList.length-1" class="no-redirect">{{generateTitle(item.meta.title)}}</span>
        <router-link v-else :to="item.redirect||item.path">{{generateTitle(item.meta.title)}}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex'
import {generateTitle} from 'common/utils/i18n'

export default {
  created() {
    this.getBreadcrumb()
  },
  data() {
    return {
      levelList: null
    }
  },
  computed: {
    ...mapGetters([
      'me'
    ])
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  methods: {
    generateTitle,
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => item.name)
      const first = matched[0]
      if (first && first.name !== this.me.project.name) {
        matched = [{path: '', meta: { title: this.me.project.name }}].concat(matched)
      }
      this.levelList = matched
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.app-breadcrumb.el-breadcrumb
  display inline-block
  font-size 14px
  line-height 50px
  margin-left 10px
  .no-redirect
    color #97a8be
    cursor text
</style>
