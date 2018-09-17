<template>
  <div class="sites-container" :class="{'show-panel':showPanel}">
      <div class="show-button" @click="showHide">
        <svg-icon icon-class="right" class="right-icon" :class="{'icon-direction':showPanel}"></svg-icon>
      </div>
      <div style="width: 200px;height: 44px;background: #fff">
        <search-box @query="onQueryChange"></search-box>
      </div>
      <scroll-bar class="scroll-sites">
        <el-table :show-header="false" :data="sites" @cell-click="selectItem">
          <el-table-column column-key="tip" width="160">
            <template slot-scope="scope">
              <p class="site-name">{{scope.row.name}}</p>
              <p class="site-location">{{scope.row.location}}</p>
            </template>
          </el-table-column>
          <el-table-column column-key="btn" width="40">
            <template slot-scope="scope">
              <svg-icon icon-class="detail"></svg-icon>
            </template>
          </el-table-column>
        </el-table>
      </scroll-bar>
  </div>
</template>

<script type="text/ecmascript-6">
import ScrollBar from 'base/scroll-bar'
import SearchBox from 'base/search-box'
export default {
  props: {
    sites: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      showPanel: true
    }
  },
  methods: {
    showHide() {
      this.showPanel = !this.showPanel
    },
    onQueryChange(query) {
      this.$emit('query', query)
    },
    selectItem(row, column) {
      this.$emit('select', {row: row, column: column.columnKey})
    }
  },
  components: {
    ScrollBar,
    SearchBox
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.sites-container
  position relative
  transition: all 0.5s
  transform translateX(200px)
  &.show-panel
    transform translateX(0)
  .show-button
    position absolute
    width 60px
    height 60px
    border-radius 50%
    background rgba(128, 128, 128, 0.6)
    left -30px
    top 50%
    transform translateY(-50%)
    .right-icon
      position absolute
      height 30px
      width 30px
      color white
      left 4px
      top 15px
      transition: all 0.5s
      transform rotate(-180deg)
      &.icon-direction
        transform rotate(0deg)
  .scroll-sites
    width 200px
    height calc(100vh - 94px)
    right 0
    background #fff
    overflow hidden
    .site-name
      margin 0
      font-size 14px
      font-weight bold
      color #909399
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
    .site-location
      margin 0
      font-size 12px
      color #C0C4CC
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
</style>
