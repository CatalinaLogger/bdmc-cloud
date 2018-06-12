<template>
  <div class="site-wrapper">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span class="header">负责监测点 <span class="number">{{siteYes.length}}</span> 个</span>
          </div>
          <scroll-bar class="scroll-sites">
            <el-table
              :data="siteYes"
              :show-header="false">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <p class="text" v-for="(item, index) in scope.row.expand" :key="index">{{item}}</p>
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <p class="title">{{ scope.row.name }}</p>
                  <p class="text">{{ scope.row.location }}</p>
                </template>
              </el-table-column>
              <el-table-column align="center">
                <template slot-scope="scope">
                  <el-tooltip effect="dark" content="移除" placement="top">
                    <el-button type="danger" size="mini" icon="el-icon-remove-outline" @click="removeSite(scope.row)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </scroll-bar>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span class="header">未分配监测点 <span class="number">{{siteNot.length}}</span> 个</span>
          </div>
          <scroll-bar class="scroll-sites">
            <el-table
              :data="siteNot"
              :show-header="false">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <p class="text" v-for="(item, index) in scope.row.expand" :key="index">{{item}}</p>
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <p class="title">{{ scope.row.name }}</p>
                  <p class="text">{{ scope.row.location }}</p>
                </template>
              </el-table-column>
              <el-table-column align="center">
                <template slot-scope="scope">
                  <el-tooltip effect="dark" content="添加" placement="top">
                    <el-button type="success" size="mini" icon="el-icon-circle-plus-outline" @click="appendSite(scope.row)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </scroll-bar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script type="text/ecmascript-6">
import ScrollBar from 'base/scroll-bar'
import {listPois, assignPoi} from 'api/users'
export default {
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      siteYes: [],
      siteNot: []
    }
  },
  mounted() {
    this._getSites()
  },
  methods: {
    removeSite(site) {
      let index = this.siteYes.findIndex(item => {
        return item.id === site.id
      })
      this.siteYes.splice(index, 1)
      this.siteNot.push(site)
    },
    appendSite(site) {
      let index = this.siteNot.findIndex(item => {
        return item.id === site.id
      })
      this.siteNot.splice(index, 1)
      this.siteYes.push(site)
    },
    save() {
      let resultOk = true
      this.siteYes.forEach(item => {
        if (!item.user_id) {
          assignPoi(this.user.id, item.id).then(res => {
            if (!res.message) {
              resultOk = false
            }
          })
        }
      })
      this.siteNot.forEach(item => {
        if (item.user_id) {
          assignPoi(null, item.id).then(res => {
            if (!res.message) {
              resultOk = false
            }
          })
        }
      })
      return resultOk
    },
    _getSites() {
      this.siteYes = []
      this.siteNot = []
      listPois().then(res => {
        res.forEach(item => {
          if (item.props) {
            var data = JSON.parse(item.props)
            item.expand = []
            for (let key in data) {
              item.expand.push(`${key}  :  ${data[key]}`)
            }
          }
          if (!item.user_id) {
            this.siteNot.push(item)
          } else if (item.user_id === this.user.id) {
            this.siteYes.push(item)
          }
        })
      })
    }
  },
  watch: {
    user: {
      deep: true,
      handler() {
        this._getSites()
      }
    }
  },
  components: {
    ScrollBar
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.site-wrapper
  padding 0 20px
  .header
    font-size 16px
    font-weight 700
    color grey
    .number
      color red
.scroll-sites
  height 350px
  background white
  overflow: hidden
  .title
    margin 0
    font-weight 700
    font-size 16px
    line-height 16px
    color grey
  .text
    margin 0
    font-size 12px
    line-height 14px
    color #909399
</style>
