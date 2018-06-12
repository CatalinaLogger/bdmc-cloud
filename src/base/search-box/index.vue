<template>
  <div class="search-box">
    <svg-icon icon-class="magnifier" class="icon-search"></svg-icon>
    <el-input class="query-input" type="text" prefix-icon="icon" suffix-icon="icon" v-model="query" :placeholder="placeholder" ref="query"></el-input>
    <span @click="clear">
      <svg-icon icon-class="close" class="icon-clear" v-show="query" />
    </span>
  </div>
</template>

<script type="text/ecmascript-6">
import {debounce} from 'common/utils/index'

export default {
  created() {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  },
  props: {
    placeholder: {
      type: String,
      default: '搜索监测点'
    }
  },
  data() {
    return {
      query: ''
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
    },
    blur() {
      this.$refs.query.blur()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .search-box
    position relative
    width 100%
    height 100%
    padding 4px
    .icon-search
      position absolute
      width 20px
      left 10px
      top 14px
      color gray
      z-index 1
    .icon-clear
      position absolute
      width 20px
      top 14px
      right  10px
      color gray
      z-index 1
</style>
