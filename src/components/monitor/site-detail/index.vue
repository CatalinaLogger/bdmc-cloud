<template>
  <scroll-bar class="scroll-charts">
    <div class="head-bar">
      <el-radio-group class="device-group" v-model="current" @change="changeOption">
        <el-radio-button v-for="(item, index) in devices" :key="index" :label="item">{{item.name}}</el-radio-button>
      </el-radio-group>
      <el-button class="button" type="danger" @click="showScaleForm">设置阀值</el-button>
    </div>
    <el-row :gutter="20" v-if="chartList.length > 0">
      <el-col :lg="12" :xs="24" v-for="(item, index) in chartList" :key="index">
        <el-row class="title-wrapper">
          <el-col :span="24"><el-tag>{{item.name}}</el-tag></el-col>
        </el-row>
        <el-row>
          <el-col :sm="6" :xs="12" class="cell-item">
            <p class="extra-small">初始值 {{item.first}}</p>
            <p class="medium">{{item.last}} {{item.unit}}</p>
          </el-col>
          <el-col :sm="6" :xs="12" class="cell-item">
            <p class="extra-small">一级预警</p>
            <p class="extra-small">上限：{{item.oneLess}}</p>
            <p class="extra-small">下限：{{item.oneMore}}</p>
          </el-col>
          <el-col :sm="6" :xs="12" class="cell-item">
            <p class="extra-small">二级预警</p>
            <p class="extra-small">上限：{{item.twoLess}}</p>
            <p class="extra-small">下限：{{item.twoMore}}</p>
          </el-col>
          <el-col :sm="6" :xs="12" class="cell-item">
            <el-button type="primary" class="history-button" @click="showHistory(item)">查看历史数据</el-button>
          </el-col>
        </el-row>
        <chart :chartData="item" :isShow="isShow"></chart>
      </el-col>
    </el-row>
    <div class="title-wrapper"><el-tag type="danger">报警记录</el-tag></div>
    <template>
      <el-table
        :data="dangerData"
        border
        style="width: 100%">
        <el-table-column
          prop="info"
          label="报警信息">
        </el-table-column>
        <el-table-column align="center" label="报警级别">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type">{{scope.row.level}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="site"
          label="报警点">
        </el-table-column>
        <el-table-column
          align="center"
          label="时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" v-if="scope.row.state === 0" @click="showAlarmDialog(scope.row)">处理</el-button>
            <el-button type="primary" size="mini" disabled v-else>已处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <div class="title-wrapper"><el-tag type="success">签到记录</el-tag></div>
    <template>
      <el-table
        :data="signData"
        border
        style="width: 100%">
        <el-table-column
          prop="name"
          label="签到人"
          width="180">
        </el-table-column>
        <el-table-column
          prop="time"
          label="时间">
        </el-table-column>
      </el-table>
    </template>
    <div class="title-wrapper">
      <el-tag type="warning">维修记录</el-tag>
      <el-button class="keep-button" type="success" size="mini" @click="showKeepForm">添加维修记录</el-button>
    </div>
    <template>
      <el-table
        :data="keepData"
        border
        style="width: 100%">
        <el-table-column
          prop="info"
          label="维修内容">
        </el-table-column>
        <el-table-column
          align="center"
          prop="time"
          label="时间"
          width="200">
        </el-table-column>
        <el-table-column
          align="center"
          prop="name"
          label="维修人"
          width="200">
        </el-table-column>
      </el-table>
    </template>
    <el-dialog
      width="50%"
      :title="scaleTitle"
      :visible.sync="scaleVisible"
      append-to-body>
      <scale :rules="rules" ref="scaleForm"></scale>
      <div slot="footer" class="dialog-footer">
        <el-button @click="scaleVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitScaleForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="historyVisible" fullscreen append-to-body>
      <div class="history-bar">
        <el-button type="success" plain>{{history.name}}历史趋势曲线</el-button>
        <el-date-picker
          v-model="history.date"
          value-format="yyyy-MM-dd hh:mm:ss"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right">
        </el-date-picker>
        <el-button type="primary" @click="searchHistory">查询</el-button>
        <el-button type="primary" @click="exportHistory">导出</el-button>
      </div>
      <chart :height="historyHeight" :isShow="historyVisible" :chartData="history"></chart>
    </el-dialog>
    <el-dialog
      width="50%"
      :title="alarmTitle"
      :visible.sync="alarmVisible"
      append-to-body>
      <el-input type="textarea" resize v-model="danger.content"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="alarmVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAlarmContent">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="50%"
      title="新增维修记录"
      :visible.sync="keepVisible"
      append-to-body>
      <el-input type="textarea" resize v-model="keepContent"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="keepVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitKeepForm">确 定</el-button>
      </div>
    </el-dialog>
  </scroll-bar>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import BestWrapper from 'base/best-wrapper'
import ScrollBar from 'base/scroll-bar'
import Scale from './scale'
import Chart from './chart'
import {listDevices, listSensors, deviceData, listAlarms, listRegs, listKeeps, addKeep, listDeviceData} from 'api/monitor'
import {handleAlarm} from 'api/alarms'
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    site: {
      type: Object,
      default: null
    },
    devId: {
      type: Number,
      default: null
    }
  },
  computed: {
    scaleTitle() {
      return `设置阈值 - ${this.current.name ? this.current.name : ''}`
    },
    rules() {
      return this.chartList.slice()
    },
    historyHeight() {
      return (window.innerHeight - 130) + 'px'
    },
    alarmTitle() {
      return `提交处理结果 - ${this.danger.alarm.info}`
    }
  },
  data() {
    return {
      baseUrl: process.env.BASE_API,
      scaleVisible: false,
      historyVisible: false,
      keepVisible: false,
      alarmVisible: false,
      devices: [], // 所有设备数据
      current: {}, // 当前选择设备数据
      ivs: [], // 轮询请求数组
      chartList: [], // 图表数据
      dangerData: [], // 报警数据
      danger: {
        alarm: {},
        content: ''
      },
      signData: [], // 签到数据
      keepData: [], // 维修记录数据
      keepContent: '', // 维修内容
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      history: {
        date: null
      }
    }
  },
  mounted() {
    this.getDevices()
  },
  deactivated() {
    this.scaleVisible = false
    this.historyVisible = false
    this.keepVisible = false
    this.alarmVisible = false
  },
  methods: {
    showScaleForm() {
      this.scaleVisible = true
    },
    showHistory(item) {
      this.historyVisible = true
      Vue.set(this.history, 'id', item.id)
      Vue.set(this.history, 'name', item.name)
      Vue.set(this.history, 'unit', item.unit)
      Vue.set(this.history, 'date', null)
      Vue.set(this.history, 'lastId', 0)
      Vue.set(this.history, 'oneLess', item.oneLess)
      Vue.set(this.history, 'oneMore', item.oneMore)
      Vue.set(this.history, 'twoLess', item.twoLess)
      Vue.set(this.history, 'twoMore', item.twoMore)
      Vue.set(this.history, 'xData', [])
      Vue.set(this.history, 'yData', [])
    },
    exportHistory() {
      window.open(`${this.baseUrl}/history?id=${this.history.id}&start=${this.history.date[0]}&end=${this.history.date[1]}`)
    },
    showKeepForm() {
      this.keepVisible = true
    },
    // 当选择设备发生变化是重新请求数据
    changeOption() {
      // 清空以前的轮询数据
      this.ivs.forEach(item => {
        clearInterval(item)
      })
      this.ivs = []
      let cl = []
      let dl = []
      // 拼装监测图表数据
      this._listSensors(this.current.id).then(res => {
        res.forEach(item => {
          let ci = {}
          ci.id = item.id
          ci.name = item.name
          ci.unit = item.unit
          ci.first = item.value
          ci.oneLess = item.up1
          ci.oneMore = item.down1
          ci.twoLess = item.up2
          ci.twoMore = item.down2
          ci.xData = []
          ci.yData = []
          let self = this
          let ddf = function() {
            self._deviceData(1, item.id, null).then(res => {
              const size = res.data.length
              if (size > 0) {
                Vue.set(ci, 'last', res.data[0].displacement)
                for (let i = 0; i < size; i++) {
                  let recode = res.data[i]
                  Vue.set(ci.xData, size - i - 1, recode.gps_time.substring(5, 13))
                  Vue.set(ci.yData, size - i - 1, recode.displacement)
                }
              }
            })
          }
          ddf()
          // 设置轮询实时更新图表
          this.ivs.push(setInterval(ddf, 3000))
          cl.push(ci)
          this._listAlarms(item.id).then(res => {
            let di = {}
            res.slice(res.length - 20).reverse().forEach(item => {
              di.id = item.id
              di.info = item.content
              di.level = item.type === 1 ? '一级' : '二级'
              di.type = item.type === 1 ? 'danger' : 'warning'
              di.site = ci.name
              di.time = item.created_at
              di.state = item.state
              dl.push(di)
            })
          })
        })
      })
      this.chartList = cl
      this.dangerData = dl
      // 拼装签到数据并去除空值
      this._listRegs(this.current.id).then(res => {
        this.signData = res.map(item => {
          if (item.user) {
            return {name: item.user.name, time: item.time}
          }
        }).filter(item => item)
      })
      // 拼装维修记录数据并去除空值
      this._listKeeps(this.current.id).then(res => {
        this.keepData = res.map(item => {
          if (item.user) {
            return {info: item.content, time: item.time, name: item.user.name}
          }
        }).filter(item => item)
      })
    },
    getDevices() {
      this._listDevices().then(res => {
        if (res.length > 0) {
          Vue.set(this, 'devices', res)
          let dev = {}
          if (this.devId) {
            dev = res.filter(item => {
              return item.id === this.devId
            })[0]
          } else {
            dev = res[0]
          }
          Vue.set(this, 'current', dev)
          this.changeOption()
        }
      })
    },
    submitScaleForm() {
      this.scaleVisible = this.$refs.scaleForm.submit()
    },
    submitKeepForm() {
      this._addKeep().then(res => {
        if (res.id) {
          this.keepContent = ''
          this.keepVisible = false
          this.keepData.push({info: res.content, time: res.time, name: res.user.name})
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '操作失败',
            type: 'danger'
          })
        }
      })
    },
    searchHistory() {
      this.history.lastId = 0
      this._listDeviceData(this.history).then(res => {
        console.log(res)
        let arr = res.data.reverse()
        let size = arr.length
        if (size) {
          let xData = []
          let yData = []
          for (let i = 0; i < size; i++) {
            let recode = arr[i]
            xData.push(recode.gps_time)
            yData.push(recode.displacement)
          }
          Vue.set(this.history, 'xData', xData)
          Vue.set(this.history, 'yData', yData)
          this.loadMore(res.id)
        } else {
          this.$message({
            message: '未找到相关记录',
            type: 'warning'
          })
        }
      })
    },
    loadMore(id) {
      this.history.lastId = id
      this._listDeviceData(this.history).then(res => {
        let arr = res.data.reverse()
        let size = arr.length
        if (size) {
          let xData = []
          let yData = []
          for (let i = 0; i < size; i++) {
            let recode = arr[i]
            xData.push(recode.gps_time)
            yData.push(recode.displacement)
          }
          Vue.set(this.history, 'xData', this.history.xData.concat(xData))
          Vue.set(this.history, 'yData', this.history.yData.concat(yData))
          this.loadMore(res.id)
        }
      })
    },
    showAlarmDialog(alarm) {
      this.alarmVisible = true
      this.danger.alarm = alarm
    },
    confirmAlarmContent() {
      if (!this.danger.content) {
        this.$message({
          message: '请填写处理结果再提交',
          type: 'warning'
        })
        return
      }
      handleAlarm(this.danger.alarm.id, this.danger.content).then(res => {
        if (res.handle === 'ok') {
          this.alarmVisible = false
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '操作失败',
            type: 'warning'
          })
        }
      })
    },
    _initData() {
      this.devices = []
      this.current = {}
      this.ivs = []
      this.chartList = []
      this.dangerData = []
      this.signData = []
      this.keepData = []
    },
    _listDevices() {
      return listDevices(this.site.id)
    },
    _listSensors(id) {
      return listSensors(id)
    },
    _deviceData(type, deviceId, rt) {
      return deviceData(type, deviceId, rt)
    },
    _listDeviceData(data) {
      return listDeviceData(data)
    },
    _listAlarms(id) {
      return listAlarms(id)
    },
    _listRegs(id) {
      return listRegs(id)
    },
    _listKeeps(id) {
      return listKeeps(id)
    },
    _addKeep() {
      return addKeep(this.current.id, this.keepContent)
    }
  },
  watch: {
    isShow(val) {
      if (!val) {
        this.ivs.forEach(item => {
          clearInterval(item)
        })
        this.ivs = []
      } else {
        this._initData()
        this.getDevices()
      }
    }
  },
  components: {
    BestWrapper,
    ScrollBar,
    Chart,
    Scale
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.title-wrapper
  padding 10px 0
  margin-bottom 10px
  border-bottom 1px solid #ccc
  .keep-button
    position absolute
    right 0
.cell-item
  text-align center
.extra-small
  margin 0
  font-size 12px
  line-height 14px
  color grey
.medium
  margin 0
  font-size 18px
  line-height 28px
  font-weight bold
.history-button
  margin 3px auto
.scroll-charts
  width calc(100vw - 40px)
  height calc(100vh - 104px)
  background white
  overflow hidden
  .head-bar
    width 100%
    height 50px
    line-height 50px
    padding 0 7px
    background #d9dce2
    .button
      float right
      margin-top 7px
.history-bar
  width 100%
  height 50px
  line-height 50px
  padding 0 7px
  background #d9dce2
</style>
