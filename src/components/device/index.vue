<template>
  <div class="app-container">
    <el-table
      :data="deviceList"
      border
      style="width: 100%">
      <el-table-column
        align="center"
        prop="code"
        label="设备编号">
      </el-table-column>
      <el-table-column
        align="center"
        prop="name"
        label="设备类型">
      </el-table-column>
      <el-table-column
        align="center"
        prop="state"
        label="设备状态">
      </el-table-column>
      <el-table-column
        align="center"
        prop="init"
        label="初始化">
      </el-table-column>
      <el-table-column
           align="center"
        prop="time"
        label="接入时间">
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pn"
      :page-sizes="sizes"
      :page-size="ps"
      layout="total, sizes, prev, pager, next"
      :total="total">
    </el-pagination>
  </div>
</template>

<script type="text/ecmascript-6">
import Sticky from 'base/sticky'
import { pageDevice } from 'api/monitor'

export default {
  data() {
    return {
      pn: 1,
      ps: 10,
      total: 0,
      sizes: [10, 20, 30, 40],
      deviceList: []
    }
  },
  mounted() {
    this._getDeviceList()
  },
  methods: {
    handleSizeChange(val) {
      if (val > this.ps) {
        this.pn = Math.ceil(this.total / val)
      }
      this.ps = val
      this._getDeviceList()
    },
    handleCurrentChange(val) {
      this.pn = val
      this._getDeviceList()
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
    _getDeviceList() {
      pageDevice(this.pn, this.ps).then(res => {
        this.total = res.count
        let list = []
        res.result.forEach(item => {
          list.push({id: item.id2, code: this.formatHex(item.id2), name: item.name, state: item.online > 0 ? '在线' : '离线', init: item.init > 0 ? '已初始化' : '未初始化', time: item.updated_at, lonLat: this.handelFlag(item)})
        })
        this.deviceList = list
      })
    }
  },
  components: {
    Sticky
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
