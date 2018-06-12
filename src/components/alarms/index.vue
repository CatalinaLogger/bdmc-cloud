<template>
  <div class="app-container">
    <el-table
      :data="alarms"
      size="mini"
      border
      style="width: 100%">
      <el-table-column
        align="center"
        prop="content"
        label="报警信息"
        width="300">
      </el-table-column>
      <el-table-column
        align="center"
        label="报警级别">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 1 ? 'danger' : 'warning'">{{scope.row.type === 1 ? '一级' : '二级'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="poi.name"
        label="监测点">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1024"
        align="center"
        prop="poi.location"
        label="位置">
      </el-table-column>
      <el-table-column
        align="center"
        prop="sensor.name"
        label="报警项目">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1440"
        align="center"
        prop="time"
        label="发生时间">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1024"
        align="center"
        prop="conclusion"
        label="处理结果">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1440"
        align="center"
        prop="handleUser"
        label="处理人">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1440"
        align="center"
        prop="handleTime"
        label="处理时间">
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-if="scope.row.state === 0" @click="showAlarmDialog(scope.row)">处理</el-button>
          <el-button type="primary" size="mini" disabled v-else>已处理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      top="30vh"
      width="500px"
      :title="alarmTitle"
      :visible.sync="alarmVisible"
      append-to-body>
      <el-input type="textarea" resize v-model="current.content"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="alarmVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAlarmContent">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import {debounce} from 'common/utils'
import {listAlarms, handleAlarm} from 'api/alarms'
export default {
  data() {
    return {
      alarms: null,
      current: {
        alarm: {},
        content: ''
      },
      alarmVisible: false,
      screenWidth: 0
    }
  },
  computed: {
    alarmTitle() {
      return `提交处理结果 - ${this.current.alarm.content}`
    }
  },
  mounted() {
    this._getAlarms()
    this.screenWidth = window.innerWidth
    this.__resizeHanlder = debounce(() => {
      this.screenWidth = window.innerWidth
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  methods: {
    showAlarmDialog(alarm) {
      this.current.alarm = alarm
      this.current.content = ''
      this.alarmVisible = true
    },
    confirmAlarmContent() {
      if (!this.current.content) {
        this.$message({
          message: '请填写处理结果好再提交',
          type: 'warning'
        })
        return
      }
      handleAlarm(this.current.alarm.id, this.current.content).then(res => {
        if (res.handle === 'ok') {
          this.alarmVisible = false
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this._getAlarms()
        } else {
          this.$message({
            message: '操作失败',
            type: 'warning'
          })
        }
      })
    },
    _getAlarms() {
      listAlarms().then(res => {
        this.alarms = res
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
