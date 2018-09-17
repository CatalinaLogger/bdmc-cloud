<template>
  <div class="scroll-charts">
    <div class="head-bar" v-show="devices.length > 0">
      <el-radio-group v-model="current" @change="changeOption" v-if="devices.length < 11">
        <el-radio-button v-for="(item, index) in devices" :key="index" :label="item">
          <span class="sign" :class="{online: item.online}"></span>
          <span class="name">{{item.name}}</span>
          <span class="code">{{formatHex(item.id2)}}</span>
        </el-radio-button>
      </el-radio-group>
      <el-select class="device-select" v-model="select" @change="changeSelect" placeholder="请选择设备" v-else>
        <el-option
          v-for="item in devices"
          :key="item.id"
          :label="item.name + ' - ' + formatHex(item.id2)"
          :value="item.id">
          <span class="sign" :class="{online: item.online}"></span>
          <span>{{item.name + ' - '+ formatHex(item.id2)}}</span>
        </el-option>
      </el-select>
      <el-button class="button" type="danger" @click="showScaleForm">设置阀值</el-button>
    </div>
    <el-collapse v-model="active">
      <el-collapse-item name="0">
        <template slot="title">
          <el-tag>监测数据</el-tag>
        </template>
        <el-row :gutter="20" v-if="chartList.length > 0">
          <el-col :lg="12" :xs="24" v-for="(item, index) in chartList" :key="index">
            <el-row class="title-wrapper">
              <el-col :span="24">
                <div class="category-header">
                  <div class="title">
                    {{item.name}}
                  </div>
                  <div class="empty"></div>
                </div>
              </el-col>
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
                <el-button class="history-button" @click="showHistory(item)" round>查看历史数据</el-button>
              </el-col>
            </el-row>
            <chart :chartData="item" :isShow="isShow"></chart>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="1">
        <template slot="title">
          <el-tag type="success">调研报告</el-tag>
        </template>
        <img class="report" v-for="item in imageList" :key="item.info_path" :src="'http://cloud.bdsmc.net:8000/' + item.info_path">
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <el-tag type="danger">告警数据</el-tag>
        </template>
        <el-tabs v-model="warnType" type="card" @tab-click="handleTabsClick">
          <el-tab-pane label="监测告警" name="0">
            <el-table
              border
              style="width: 100%"
              :data="warnData"
              :row-class-name="tableRowClassName">
              <el-table-column
                align="center"
                prop="content"
                label="告警信息"
                width="300">
              </el-table-column>
              <el-table-column
                align="center"
                prop="name"
                label="告警项目">
              </el-table-column>
              <el-table-column
                align="center"
                prop="time"
                label="发生时间">
              </el-table-column>
              <el-table-column
                align="center"
                label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" v-if="scope.row.state === 0" @click="handelWarn(scope.row)">上报处理结果</el-button>
                  <el-button type="success" size="mini" v-else @click="showResult(scope.row)">查看处理结果</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              @current-change="handleCurrentChange"
              :current-page.sync="pn"
              :page-size="ps"
              layout="total, prev, pager, next"
              :total="total">
            </el-pagination>
          </el-tab-pane>
          <el-tab-pane label="设备告警" name="1">
            <el-table
              border
              style="width: 100%"
              :data="warnData"
              :row-class-name="tableRowClassName">
              <el-table-column
                align="center"
                prop="content"
                label="告警信息"
                width="300">
              </el-table-column>
              <el-table-column
                align="center"
                prop="name"
                label="告警项目">
              </el-table-column>
              <el-table-column
                align="center"
                prop="time"
                label="发生时间">
              </el-table-column>
              <el-table-column
                align="center"
                label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" v-if="scope.row.state === 0" @click="handelWarn(scope.row)">上报处理结果</el-button>
                  <el-button type="success" size="mini" v-else @click="showResult(scope.row)">查看处理结果</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              @current-change="handleCurrentChange"
              :current-page.sync="pn"
              :page-size="ps"
              layout="total, prev, pager, next"
              :total="total">
            </el-pagination>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template slot="title">
          <el-tag type="warning">维修记录</el-tag>
        </template>
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
        <el-button class="keep-button" type="success" size="mini" @click="showKeepForm">添加维修记录</el-button>
      </el-collapse-item>
<!--

      <el-collapse-item name="4">
        <template slot="title">
          <el-tag type="success">签到记录</el-tag>
        </template>
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
      </el-collapse-item>

-->
    </el-collapse>
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
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right">
        </el-date-picker>
        <el-button type="primary" :disabled="!history.date" @click="searchHistory">查询</el-button>
        <el-button type="primary" :disabled="!history.date" @click="exportHistory">导出</el-button>
      </div>
      <chart :height="historyHeight" :isShow="historyVisible" :chartData="history"></chart>
    </el-dialog>
    <el-dialog
      top="30vh"
      width="500px"
      title="提交处理结果"
      :visible.sync="handelVisible"
      append-to-body>
      <el-input type="textarea" resize v-model="warnModel.result" :placeholder="warnModel.content"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handelVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveResult">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      top="30vh"
      width="500px"
      title="查看处理结果"
      :visible.sync="resultVisible"
      append-to-body>
      <p>{{warnModel.result}}</p>
      <p class="handel">{{warnModel.handel}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resultVisible = false">确 定</el-button>
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
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import BestWrapper from 'base/best-wrapper'
import ScrollBar from 'base/scroll-bar'
import Scale from './scale'
import Chart from './chart'
import {listDevices, listSensors, deviceData, listRegs, listKeeps, addKeep, listDeviceData, getSurveyReport} from 'api/monitor'
import { alarmsDevice, alarmsSensor, handleDeviceAlarm, handleSensorAlarm } from 'api/warn'
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
      return `上报处理结果 - ${this.danger.alarm.info}`
    }
  },
  data() {
    return {
      baseUrl: process.env.BASE_API,
      active: '0',
      imageList: [],
      scaleVisible: false,
      historyVisible: false,
      keepVisible: false,
      alarmVisible: false,
      devices: [], // 所有设备数据
      select: {},
      current: {}, // 当前选择设备数据
      ivs: [], // 轮询请求数组
      chartList: [], // 图表数据
      pn: 1,
      ps: 20,
      total: 0,
      warnType: '0',
      warnData: [], // 报警数据
      warnModel: {
        id: null,
        content: '',
        result: '',
        handel: ''
      },
      handelVisible: false,
      resultVisible: false,
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
        date: ''
      }
    }
  },
  mounted() {
    this.getDevices()
    this._getSurveyReport()
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
    changeSelect() {
      this.current = this.devices.filter(item => {
        return item.id === this.select
      })[0]
      this.changeOption()
    },
    // 当选择设备发生变化是重新请求数据
    changeOption() {
      // 清空以前的轮询数据
      this.ivs.forEach(item => {
        clearInterval(item)
      })
      this.ivs = []
      let cl = []
      // 拼装监测图表数据
      this._listSensors(this.current.id).then(res => {
        let sen = res.filter(item => {
          console.log(item)
          if (item.name.indexOf('经') > -1 || item.name.indexOf('纬') > -1 || item.name.indexOf('海') > -1) {
            return false
          }
          return true
        })
        sen.forEach(item => {
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
        })
      })
      this.chartList = cl
      // 拼装报警数据
      this.pn = 1
      this.total = 0
      this.warnData = []
      this._loadWarns(this.warnType)
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
          Vue.set(this, 'select', dev.id)
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
        let arr = res.data
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
        let arr = res.data
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
    handelWarn(warn) {
      this.warnModel.id = warn.id
      this.warnModel.content = warn.content
      this.warnModel.result = ''
      this.handelVisible = true
    },
    showResult(warn) {
      this.warnModel.id = warn.id
      this.warnModel.content = warn.content
      this.warnModel.result = warn.conclusion
      this.warnModel.handel = `${warn.handleUser} ${warn.handleTime}`
      this.resultVisible = true
    },
    saveResult() {
      if (this.warnModel.result) {
        if (this.warnType === '1') { // device
          handleDeviceAlarm(this.warnModel).then(res => {
            this.handelResult(res)
          })
        } else { // sensor
          handleSensorAlarm(this.warnModel).then(res => {
            this.handelResult(res)
          })
        }
      } else {
        this.$message({
          message: '请先填写好处理结果再进行提交',
          type: 'warning'
        })
      }
    },
    handelResult(data) {
      if (data.id) {
        this.handelVisible = false
        this.pn = 1
        this.total = 0
        this.warnData = []
        this._loadWarns(this.warnType)
        this.$message.success('操作成功')
      } else {
        this.$message.error('操作失败')
      }
    },
    handleTabsClick() {
      this.pn = 0
      this._loadWarns(this.warnType)
    },
    handleCurrentChange(val) {
      this.pn = val
      this._loadWarns(this.warnType)
    },
    formatHex(val) {
      let str = parseInt(val).toString(16)
      return this.prefixInteger(str.substring(0, str.length - 4), 12)
    },
    prefixInteger(num, length) {
      return (Array(length).join('0') + num).slice(-length)
    },
    _loadWarns(type) {
      if (type === '1') { // device
        alarmsDevice(this.pn - 1, this.ps, this.current.id, null, null, []).then(res => {
          this.total = res.totalCount
          this.warnData = res.alarms
        })
      } else { // sensor
        alarmsSensor(this.pn - 1, this.ps, this.current.id, null, null, []).then(res => {
          this.total = res.totalCount
          this.warnData = res.alarms
        })
      }
    },
    tableRowClassName({row}) {
      if (row.type === 1) {
        return 'one-row'
      } else {
        return 'two-row'
      }
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
    _getSurveyReport() {
      getSurveyReport(this.site.id, '2').then(res => {
        this.imageList = res
      })
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
        this._getSurveyReport()
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
.el-radio-button
.el-select-dropdown__item
  &:hover
    .name
      display none
    .code
      display inline
  .sign
    display inline-block
    width 12px
    height 12px
    background red
    &.online
      background #00ff00
  .code
    display none
.cell-item
  text-align center
.extra-small
  margin 0
  color #909399
  font-size 12px
  line-height 14px
.medium
  margin 0
  color #606266
  font-size 16px
  line-height 28px
  font-weight bold
.history-button
  margin 3px auto
.scroll-charts
  padding 0 20px
  width 100vw
  background white
  .head-bar
    width 100%
    height 50px
    line-height 50px
    padding 0 7px
    background #d9dce2
    .device-select
      width 400px
    .button
      float right
      margin-top 7px
.history-bar
  width 100%
  height 50px
  line-height 50px
  padding 0 7px
  background #d9dce2
.report
  display block
  margin 0 auto
.keep-button
  float right
.title-wrapper
  height 50px
  .category-header
    position relative
    margin 0 10px
    .title
      position absolute
      display inline-block
      padding 0 40px
      height 40px
      color #409eff
      font-size 16px
      font-weight bold
      line-height 40px
      border-bottom 5px solid #409eff
      z-index 10
    .empty
      position absolute
      width 100%
      height 40px
      border-bottom 5px solid #b3d8ff
</style>
