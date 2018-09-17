<template>
  <div class="warn-container">
    <sticky className="tool-bar info">
      <template>
        <el-radio-group v-model="warnType" @change="changeType">
          <el-radio-button :label="0">监测告警</el-radio-button>
          <el-radio-button :label="1">设备告警</el-radio-button>
          <el-radio-button :label="2">入侵告警</el-radio-button>
        </el-radio-group>
        <el-input class="query" v-model="query" placeholder="设备编号"></el-input>
        <el-select v-model="level" placeholder="请选择级别">
          <el-option label="一级告警" :value="1"></el-option>
          <el-option label="二级告警" :value="2"></el-option>
        </el-select>
        <el-date-picker
          v-model="date"
          type="daterange"
          :clearable="false"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-button-group>
          <el-button type="danger" @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="selectFilter">查询</el-button>
        </el-button-group>
      </template>
    </sticky>
    <el-table
      v-show="warnType === 0"
      border
      style="width: 100%"
      :data="list"
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
        prop="poi_name"
        label="监测点">
      </el-table-column>
      <el-table-column
        align="center"
        prop="poi_location"
        label="位置">
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
    <el-table
      v-show="warnType === 1"
      border
      style="width: 100%"
      :data="list"
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
        prop="poi_name"
        label="监测点">
      </el-table-column>
      <el-table-column
        align="center"
        prop="poi_location"
        label="位置">
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
    <el-table
      v-show="warnType === 2"
      border
      style="width: 100%"
      :data="list"
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
        prop="poi_name"
        label="监测点">
      </el-table-column>
      <el-table-column
        align="center"
        prop="poi_location"
        label="位置">
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
    <p class="bottom-tip" v-show="hasMore" @click="loadMore">
      <i class="el-icon-loading" v-show="loading"></i>
      <span>{{footerTip}}</span>
    </p>
    <el-dialog
      top="30vh"
      width="500px"
      title="上报处理结果"
      :visible.sync="handelVisible"
      append-to-body>
      <el-input type="textarea" resize v-model="model.result" :placeholder="model.content"></el-input>
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
      <p>{{model.result}}</p>
      <p class="handel">{{model.handel}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resultVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import Sticky from 'base/sticky'
import { alarmsDevice, alarmsSensor, alarmsCamera, handleDeviceAlarm, handleSensorAlarm, handleCameraAlarm } from 'api/warn'

export default {
  data() {
    return {
      warnType: 0,
      hasMore: true,
      loading: false,
      footerTip: '点击加载更多',
      query: null,
      level: null,
      date: [],
      pn: 0,
      ps: 16,
      list: [],
      model: {
        id: null,
        content: '',
        result: '',
        handel: ''
      },
      handelVisible: false,
      resultVisible: false
    }
  },
  mounted() {
    this._loadWarns(this.warnType)
  },
  methods: {
    resetFilter() {
      this.query = null
      this.level = null
      this.date = []
      this.hasMore = true
      this.pn = 0
      this.list = []
      this._loadWarns(this.warnType)
    },
    selectFilter() {
      this.hasMore = true
      this.pn = 0
      this.list = []
      this._loadWarns(this.warnType)
    },
    changeType(type) {
      this.hasMore = true
      this.pn = 0
      this.list = []
      this._loadWarns(type)
    },
    loadMore() {
      if (!this.loading) {
        this.pn += 1
        this._loadWarns(this.warnType)
      }
    },
    formatHex(val) {
      if (val && val.length > 0) {
        return parseInt(val + '0000', 16)
      }
      return null
    },
    _loadWarns(type) {
      this.loading = true
      this.footerTip = '拼命加载中'
      if (type === 0) { // sensor
        alarmsSensor(this.pn, this.ps, null, this.formatHex(this.query), this.level, this.date).then(res => {
          if (res.alarms.length > 0) {
            this.list = this.list.concat(res.alarms)
          }
          if (res.alarms.length < this.ps) {
            this.hasMore = false
          }
          this.loading = false
          this.footerTip = '点击加载更多'
        })
      } else if (type === 1) { // device
        alarmsDevice(this.pn, this.ps, null, this.formatHex(this.query), this.level, this.date).then(res => {
          if (res.alarms.length > 0) {
            this.list = this.list.concat(res.alarms)
          }
          if (res.alarms.length < this.ps) {
            this.hasMore = false
          }
          this.loading = false
          this.footerTip = '点击加载更多'
        })
      } else { // camera
        alarmsCamera(this.pn, this.ps, null, this.formatHex(this.query), this.level, this.date).then(res => {
          if (res.alarms.length > 0) {
            this.list = this.list.concat(res.alarms)
          }
          if (res.alarms.length < this.ps) {
            this.hasMore = false
          }
          this.loading = false
          this.footerTip = '点击加载更多'
        })
      }
    },
    handelWarn(warn) {
      this.model.id = warn.id
      this.model.content = warn.content
      this.model.result = ''
      this.handelVisible = true
    },
    showResult(warn) {
      this.model.id = warn.id
      this.model.content = warn.content
      this.model.result = warn.conclusion
      this.model.handel = `${warn.handleUser} ${warn.handleTime}`
      this.resultVisible = true
    },
    saveResult() {
      if (this.model.result) {
        if (this.warnType === 0) { // sensor
          handleSensorAlarm(this.model).then(res => {
            console.log(res)
            this.handelResult(res)
          })
        } else if (this.warnType === 1) { // device
          handleDeviceAlarm(this.model).then(res => {
            this.handelResult(res)
          })
        } else { // camera
          handleCameraAlarm(this.model).then(res => {
            this.handelResult(res)
          })
        }
      } else {
        this.$message({
          message: '请先填写好处理结果再进行上报',
          type: 'warning'
        })
      }
    },
    handelResult(data) {
      if (data.id) {
        this.handelVisible = false
        this.hasMore = true
        this.pn = 0
        this.list = []
        this._loadWarns(this.warnType)
        this.$message.success('操作成功')
      } else {
        this.$message.error('操作失败')
      }
    },
    tableRowClassName({row}) {
      if (row.type === 1) {
        return 'one-row'
      } else {
        return 'two-row'
      }
    }
  },
  components: {
    Sticky
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.warn-container
  .tool-bar
    .el-input
      display inline-block
      width 160px
    .el-select
      width 160px
    .el-button-group
      margin-top -1px
  .el-radio-group
    float left
    margin 6px 20px
  .bottom-tip
    margin 0
    height 50px
    line-height 50px
    text-align center
.handel
  text-align right
</style>
