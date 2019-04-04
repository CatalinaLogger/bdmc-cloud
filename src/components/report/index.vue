<template>
  <div class="report-container">
    <sticky className="tool-bar info">
      <template>
        <el-select v-model="projectId" placeholder="项目">
          <el-option v-for="item in projectList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
        <el-select v-model="online" placeholder="设备状态">
          <el-option label="在线" :value="1"></el-option>
          <el-option label="掉线" :value="0"></el-option>
        </el-select>
        <el-select v-model="recentUpdate" placeholder="数据最近更新时间">
          <el-option label="平台无数据" :value="0"></el-option>
          <el-option label="两小时内无数据" :value="1"></el-option>
          <el-option label="两小时内有数据" :value="2"></el-option>
        </el-select>
        <el-button-group>
          <el-button type="danger" @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="selectFilter">查询</el-button>
        </el-button-group>
      </template>
    </sticky>
    <table class="report">
      <tr>
        <th style="width: 4%">项目名称</th>
        <th style="width: 4%">监测点名称</th>
        <th style="width: 4%">设备类型</th>
        <th style="width: 4%">设备类型名</th>
        <th style="width: 4%">设备数量</th>
        <th style="width: 4%">设备MAC</th>
        <th style="width: 4%">设备ID</th>
        <th style="width: 5%">当前设备状态</th>
        <th style="width: 5%">平台最近数据更新时间</th>
        <th style="width: 4%">一天内是否存在报警</th>
      </tr>
      <tr v-for="item in reportData" :key="item.id">
        <td style="width: 4%" class="column0" v-if="!item.hidden0" :rowspan="item.rowspan0">{{item.projectName}}</td>
        <td style="width: 4%" class="column1" v-if="!item.hidden1" :rowspan="item.rowspan1">{{item.poiName}}</td>
        <td style="width: 4%" class="column2" v-if="!item.hidden2" :rowspan="item.rowspan2">{{item.device_type}}</td>
        <td style="width: 4%" class="column3" v-if="!item.hidden2" :rowspan="item.rowspan2">{{item.deviceTypeName}}</td>
        <td style="width: 4%" class="column4" v-if="!item.hidden2" :rowspan="item.rowspan2">{{item.deviceNum}}</td>
        <td style="width: 4%" class="column5" @click="showDetail(item)">{{item.mac}}</td>
        <td style="width: 4%" class="column6">{{item.deviceId}}</td>
        <td style="width: 5%" class="column7" :class="[item.online? 'online' : 'offline']">{{item.online? '在线，1小时内心跳正常': '掉线'}}</td>
        <td style="width: 5%" class="column8" :class="classTime(item.gps_time)">{{item.gps_time? item.gps_time: '平台无解算结果'}}</td>
        <td style="width: 5%" class="column9" :class="[item.warn? 'warn': 'non-warn']">{{item.warn? item.warn: '无'}}</td>
      </tr>
    </table>
    <div class="bd-dialog">
      <el-dialog
        fullscreen
        :title="current.poiName"
        :visible.sync="visible">
        <div class="detail-body">
          <el-row>
            <el-col :span="4">项目</el-col>
            <el-col :span="4">{{deviceInfo.projectName}}</el-col>
            <el-col :span="4">监测点名称</el-col>
            <el-col :span="4">{{deviceInfo.poiName}}</el-col>
            <el-col :span="4">监测点地址</el-col>
            <el-col :span="4">{{deviceInfo.location}}</el-col>
            <el-col :span="4">设备名</el-col>
            <el-col :span="4">{{deviceInfo.deviceName}}</el-col>
            <el-col :span="4">设备状态</el-col>
            <el-col :span="4">{{deviceInfo.online? '在线': '掉线'}}</el-col>
            <el-col :span="4">设备Mac</el-col>
            <el-col :span="4">{{deviceInfo.mac}}</el-col>
          </el-row>
          <div class="table-head">
            <table>
              <colgroup>
                <col style="width: 10%;" v-for="item in deviceData.sensorsArray" :key="'col' + item">
              </colgroup>
              <thead>
                <tr>
                  <th v-for="item in deviceData.sensorsArray" :key="'head' + item">{{item}}</th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="table-body">
            <table>
              <colgroup>
                <col style="width: 10%;" v-for="item in deviceData.sensorsArray" :key="'body' + item">
              </colgroup>
              <tbody>
                <tr v-for="(data, index1) in deviceData.data" :key="index1">
                  <td v-for="(item, index2) in data" :key="index1 + '-' + index2">{{item}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <el-pagination
            background
            @current-change="currentChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next, total"
            :total="totalRecode">
          </el-pagination>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import Sticky from 'base/sticky'
import { getProjectList, getReportData, getReportDataType, getDeviceInfo, getDeviceData } from 'api/report'

export default {
  data() {
    return {
      projectList: [],
      projectId: 18,
      online: null,
      recentUpdate: null,
      reportData: [],
      warnData: [],
      visible: false,
      current: {},
      deviceInfo: {},
      deviceData: [],
      currentPage: 1,
      pageSize: 100,
      totalRecode: 1000
    }
  },
  mounted() {
    this._initData()
  },
  methods: {
    resetFilter() {
      this.online = null
      this.recentUpdate = null
      this.reportData = []
      this.warnData = []
      this._getReportData()
    },
    selectFilter() {
      this.reportData = []
      this.warnData = []
      this._getReportData()
    },
    showDetail(data) {
      this.current = data
      this.visible = true
      getDeviceInfo(data.deviceId).then(res => {
        this.deviceInfo = res[0]
      })
      getDeviceData(data.deviceId, this.currentPage, this.pageSize).then(res => {
        console.log(res)
        this.deviceData = res
      })
    },
    currentChange() {
    },
    classTime(date) {
      if (date) {
        date = date.substring(0, 19)
        date = date.replace(/-/g, '/')
        let stamp = new Date(date).getTime()
        let now = new Date().getTime()
        let days = (now - stamp) / 1000 / 60 / 60 / 24
        if (days > 2) {
          return 'non-empty'
        }
      } else {
        return 'empty'
      }
    },
    _getReportData() {
      getReportData(this.projectId, this.online, this.recentUpdate).then(res => {
        let size = res.length
        if (size > 0) {
          let index0 = 0
          let index1 = 0
          let index2 = 0
          res.forEach((item, index) => {
            /** 第一列 */
            if (index >= index0) {
              let all = true
              for (let i = index + 1; i < size; i++) {
                let next = res[i]
                if (next.projectId !== item.projectId) {
                  item.rowspan0 = i - index
                  all = false
                  index0 = i
                  break
                }
              }
              if (all) {
                item.rowspan0 = size
                index0 = size
              }
            } else {
              item.hidden0 = true
            }
            /** 第二列 */
            if (index >= index1) {
              let all = true
              for (let i = index + 1; i < size; i++) {
                let next = res[i]
                if (next.poiId !== item.poiId) {
                  item.rowspan1 = i - index
                  all = false
                  index1 = i
                  break
                }
              }
              if (all) {
                item.rowspan1 = size
                index1 = size
              }
            } else {
              item.hidden1 = true
            }
            /** 第三列 */
            if (index >= index2) {
              let all = true
              for (let i = index + 1; i < size; i++) {
                let next = res[i]
                if (next.poiId !== item.poiId || next.device_type !== item.device_type) {
                  item.rowspan2 = i - index
                  all = false
                  index2 = i
                  break
                }
              }
              if (all) {
                item.rowspan2 = size
                index2 = size
              }
            } else {
              item.hidden2 = true
            }
          })
          this.reportData = res
          this._handelData()
        }
      })
      getReportDataType(this.projectId).then(res => {
        this.warnData = res
        this._handelData()
      })
    },
    _handelData() {
      this.warnData.forEach(warn => {
        this.reportData.forEach(item => {
          if (warn.deviceId === item.deviceId) {
            item.warn = warn.content
          }
        })
      })
    },
    _initData() {
      getProjectList().then(res => {
        this.projectList = res
      })
    }
  },
  components: {
    Sticky
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.report-container
  .tool-bar
    .el-select
      width 160px
    .el-button-group
      margin-top -1px
  .report
    font-size 14px
    width 100%
    text-align center
    cursor default
    border-collapse collapse
    tr
      th, td
        border-right 1px solid #d9dce2
        border-bottom 1px solid #d9dce2
        &:last-child
          border-right 0
      th
        padding 10px 0
        color white
        background #409eff
      td
        padding 5px 0
      .column0
        font-weight bold
        color #409EFF
        background #F2F6FC
      .column2
        background #F2F6FC
      .column3
        color #E6A23C
      .column4
        background #F2F6FC
      .column5
        color #909399
        text-decoration underline
        &:hover
          color #409eff
      .column6
        background #F2F6FC
      .offline
        color white
        background #F56C6C
      .non-empty
        color white
        background #E6A23C
      .empty
        color white
        background #909399
      .warn
        color white
        background #F56C6C
.detail-body
  height calc(100vh - 50px)
  background #606266
  .el-row
    color white
    text-align center
    .el-col
      padding 5px 0
      &:nth-child(odd)
        color yellow
      &:nth-child(even)
        background #909399
  table
    width 100%
    cursor default
    border-collapse collapse
    text-align center
    tr
      th, td
        border-right 1px solid #d9dce2
        border-bottom 1px solid #d9dce2
  .table-head
    color white
    background #545c64
  .table-body
    height calc(100vh - 180px)
    color white
    overflow-y auto
    tr:nth-child(odd)
      background #909399
    tr:hover
      color #303133
      background white
    &::-webkit-scrollbar/*滚动条整体样式*/
      width 0px     /*高宽分别对应横竖滚动条的尺寸*/
      height 0px
    &::-webkit-scrollbar-thumb/*滚动条里面小方块*/
      border-radius 10px
      -webkit-box-shadow inset 0 0 5px rgba(0,0,0,0.2);
      background #606266
    &::-webkit-scrollbar-track/*滚动条里面轨道*/
      -webkit-box-shadow inset 0 0 5px rgba(0,0,0,0.2);
      border-radius 10px
      background #EDEDED
</style>
