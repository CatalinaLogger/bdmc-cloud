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
                <scroll-bar class="device-scroll">
                  <p class="info"><span class="name">设备编号</span><span class="value">{{formatHex(dev.id2)}}</span></p>
                  <p class="info"><span class="name">设备状态</span><span class="value">{{dev.online>0?'在线':'离线'}}</span></p>
                  <p class="info"><span class="name">初始化状态</span><span class="value">{{dev.init>0?'已初始化':'未初始化'}}</span></p>
                  <p class="info"><span class="name">接入时间</span><span class="value">{{dev.updated_at}}</span></p>
                  <div v-if="!dev.hasMore">
                    <p class="info"><span class="name">版本号</span><span class="value">{{dev.majorVersionNumber}} . {{dev.minorVersionNumber}} . {{dev.revisionNumber}}</span></p>
                    <div class="param">
                      <span class="name">上报周期</span>
                      <el-input-number class="value"
                                       size="mini"
                                       v-model="dev.reportCycle"
                                       :min="0"
                                       :max="4294967296">
                      </el-input-number>
                    </div>
                    <div class="param">
                      <span class="name">通信方式</span>
                      <el-switch class="value"
                                 v-model="dev.communicationWay"
                                 :active-value="1"
                                 :inactive-value="0"
                                 active-color="#13ce66"
                                 inactive-color="#ff4949"
                                 active-text="LORA"
                                 inactive-text="GPRS">
                      </el-switch>
                    </div>
                    <div v-if="dev.communicationWay === 1" v-for="(item, index) in dev.lora" :key="item.id2 + index">
                      <p class="info"><span class="name">LORA编号</span><span class="value">{{item.loraId}}</span></p>
                      <p class="info"><span class="name">发射功率</span><span class="value">{{item.power}}</span></p>
                      <p class="info"><span class="name">带宽</span><span class="value">{{item.bandwidth}}</span></p>
                      <p class="info"><span class="name">扩频因子</span><span class="value">{{item.spreadingFactor}}</span></p>
                      <p class="info"><span class="name">频点</span><span class="value">{{item.frequency}}</span></p>
                    </div>
                  </div>
                  <div class="foot-bar">
                    <el-button v-if="dev.hasMore" type="primary" size="mini" :loading="dev.loading" @click="showMore(dev)">{{dev.btnText}}</el-button>
                    <el-button v-else type="primary" size="mini" :loading="dev.loading" @click="saveMore(dev)">{{dev.btnText}}</el-button>
                  </div>
                </scroll-bar>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script type="text/ecmascript-6">
import ScrollBar from 'base/scroll-bar'
import { mapGetters } from 'vuex'
import { sites, listDevices } from 'api/monitor'
import { queryDeviceOrder } from 'common/utils/client'

export default {
  data() {
    return {
      surveys: [], // 所有设备信息
      current: [] // 当前选中监测点设备信息
    }
  },
  computed: {
    ...mapGetters([
      'device'
    ])
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
          res.forEach(item => {
            item.loading = false
            item.btnText = '查看更多'
            item.hasMore = true

            item.communicationWay = 0
            item.reportCycle = 0
          })
          survey[0].devices = res
          this.current = survey[0].devices
        })
      }
    },
    blurCount(dev) {
      setTimeout(() => {
        if (dev.loraCount > dev.loraList.length) {
          dev.loraList.push({
            loraId: null,
            power: null,
            bandwidth: null,
            spreadingFactor: null,
            frequency: null
          })
        } else {
          dev.loraList.pop()
        }
      }, 10)
    },
    /** 加载更多设备信息 */
    showMore(dev) {
      dev.loading = true
      dev.btnText = '正在加载'
      queryDeviceOrder(dev.id2)
      setTimeout(() => {
        if (dev.loading) {
          this.$message({
            message: '加载设备信息失败',
            type: 'warning'
          })
          dev.loading = false
          dev.btnText = '查看更多'
        }
      }, 20000)
    },
    saveMore() {
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
  watch: {
    device(val) {
      let device = this.current.filter(item => {
        return item.id2 === val.device_id
      })[0]
      device.loading = false
      device.btnText = '保存配置'
      device.hasMore = false
      Object.assign(device, val.data)
      console.log(device)
    }
  },
  components: {
    ScrollBar
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
    &:hover
      box-shadow 0 0 8px 4px rgba(0, 0, 0, 0.3)
      z-index 10
    .device-card
      position absolute
      width 100%
      height 100%
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
      .device-scroll
        width 100%
        height 90%
        background #ebebeb
        overflow hidden
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
        .param
          display flex
          align-items center
          margin 0
          height 40px
          border-bottom 1px solid white
          .name
            width 50%
            text-align center
            line-height 40px
            border-right 1px solid white
          .value
            margin 0 auto
            width 41%
        .foot-bar
          padding 10px 20px 0 0
          float right
</style>
