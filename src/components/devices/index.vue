<template>
  <div class="app-container">
    <el-collapse @change="handleChange" accordion>
      <el-collapse-item v-for="item in surveys" :name="item.id" :key="item.id">
        <template slot="title">
          <span class="monitor-collapse">{{item.name}}</span>
        </template>
        <el-row v-if="item.devices.length > 0">
          <el-col :lg="6" :md="8" :sm="12" :xs="24" v-for="dev in item.devices" :key="dev.id">
            <div class="device-box">
              <div class="device-card">
                <p class="head" :class="[dev.online > 0 ? 'online' : 'offline']">{{dev.name}} {{handelFlag(dev)}}</p>
                <p class="info"><span class="name">设备编号</span><span class="value">{{formatHex(dev.id2)}}</span></p>
                <p class="info"><span class="name">设备状态</span><span class="value">{{dev.online>0?'在线':'离线'}}</span></p>
                <p class="info"><span class="name">初始化状态</span><span class="value">{{dev.init>0?'已初始化':'未初始化'}}</span></p>
                <p class="info"><span class="name">接入时间</span><span class="value">{{dev.updated_at}}</span></p>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script type="text/ecmascript-6">
import treeTable from 'base/tree-table'
import {sites, listDevices} from 'api/monitor'

export default {
  data() {
    return {
      columns: [
        {
          text: '部门名称',
          value: 'name'
        }
      ],
      surveys: []
    }
  },
  mounted() {
    this._getSurveys()
  },
  methods: {
    handleChange(id) {
      if (id) {
        listDevices(id).then(res => {
          let survey = this.surveys.filter(item => {
            return item.id === id
          })
          console.log(survey)
          survey[0].devices = res
        })
      }
    },
    handelFlag(dev) {
      let latflag = dev.latflag === 0 ? 'E' : 'W'
      let lngflag = dev.lngflag === 0 ? 'S' : 'N'
      return `( ${this.formatDegree(dev.lat)} ${latflag},${this.formatDegree(dev.lng)} ${lngflag} )`
    },
    formatDegree(value) {
      // 将度转换成为度分秒
      value = Math.abs(value)
      var v1 = Math.floor(value)
      var v2 = Math.floor((value - v1) * 60)
      var v3 = Math.round((value - v1) * 3600 % 60)
      return v1 + '°' + v2 + '\'' + v3 + '"'
    },
    formatHex(val) {
      let str = parseInt(val).toString(16)
      return this.prefixInteger(str.substring(0, str.length - 4), 12)
    },
    prefixInteger(num, length) {
      return (Array(length).join('0') + num).slice(-length)
    },
    _getSurveys() {
      sites().then(res => {
        res.forEach(item => {
          this.surveys.push({id: item.id, name: item.name, devices: []})
        })
      })
    }
  },
  components: {
    treeTable
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.monitor-collapse
  color #409eff
  font-size 16px
.el-col
  padding 10px
  .device-box
    position relative
    width 100%
    padding-top 100%
    border-radius 10px
    overflow hidden
    transition .2s
    transform scale(.9)
    &:hover
      transform scale(1)
      box-shadow 0 0 8px 4px rgba(0, 0, 0, 0.3)
      z-index 10
    .device-card
      position absolute
      width 100%
      height 100%
      background #ebebeb
      transform translateY(-100%)
      .head
        margin 0
        text-align center
        white-space nowrap
        line-height 40px
        &.online
          color white
          background #67c23a
        &.offline
          color white
          background #909399
      .info
        margin 0
        line-height 40px
        text-align center
        border-bottom 1px solid white
        .name
          display inline-block
          width 50%
          border-right 1px solid white
        .value
          display inline-block
          width 50%
</style>
