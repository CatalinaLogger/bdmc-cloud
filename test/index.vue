<template>
  <div class="monitor-container">
    <el-amap class="amap-demo" vid="amapDemo" :center="center" :zoom="zoom" :plugin="plugin" ref="map">
      <el-amap-marker v-for="(marker, index) in markers" :position="marker.position" :events="marker.events" :animation="marker.animation" :label="marker.label" :key="index"></el-amap-marker>
      <el-amap-info-window :position="currentWindow.position" :visible="currentWindow.visible" :events="currentWindow.events" :offset="currentWindow.offset" v-if="currentWindow.visible">
        <template>
          <div class="site-window">
            <span class="site-name">{{currentWindow.name}}</span>
            <span class="site-location">{{currentWindow.location}}</span>
            <el-table
              class="site-table"
              :data="winData.td"
              size="mini"
              :fit="false"
              border>
              <el-table-column v-for="(item, index) in winData.th" v-if="showColumn(index)" :label="item" :key="index">
                <template slot-scope="scope">
                  {{scope.row[index]}}
                </template>
              </el-table-column>
            </el-table>
            <el-button class="site-btn" type="success" size="mini" @click="dialogVisible = true">查看详情</el-button>
          </div>
        </template>
      </el-amap-info-window>
    </el-amap>
    <sites class="monitor-table" :sites="sites" @query="onQueryChange" @select="selectItem"></sites>
    <el-dialog class="dialog-detail" :visible.sync="dialogVisible" :title="title" fullscreen>
      <site-detail :isShow="dialogVisible" :site="current"></site-detail>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import Sites from '../src/components/monitor/sites'
import SiteDetail from '../src/components/monitor/site-detail/index'
import {AMapManager} from 'vue-amap'
import {sites, sitesFilter, listDevices, listSensors, deviceData} from 'api/monitor'
export default {
  data() {
    let self = this
    return {
      dialogVisible: false,
      query: '',
      sites: [],
      current: {},
      AMapManager,
      zoom: 12,
      center: [113.00, 28.21],
      markers: [],
      plugin: ['ToolBar', 'MapType'],
      currentWindow: {
        position: [0, 0],
        offset: [0, -20],
        visible: false,
        events: {
          close() {
            self.currentWindow.visible = false
            self.clearIvs()
          }
        },
        name: '',
        location: ''
      },
      winData: {},
      ivs: []
    }
  },
  computed: {
    title() {
      return `${this.current.name} - ${this.current.location}[${this.current.lat},${this.current.lng}]`
    }
  },
  created() {
    this._getSites()
  },
  deactivated() {
    this.clearIvs()
    this.currentWindow.visible = false
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    search() {
      if (this.query === '') {
        this._getSites()
      } else {
        this._getSitesFilter()
      }
    },
    selectItem(data) {
      this.clearIvs()
      this.currentWindow.visible = false
      this.current = data.row
      if (data.column === 'btn') {
        this.dialogVisible = true
      } else {
        this.showWindowDialog(this.current)
      }
    },
    clickMarker(id) {
      this.clearIvs()
      this.currentWindow.visible = false
      this.current = this.sites.find((item) => {
        return item.id === id
      })
      this.showWindowDialog(this.current)
    },
    showWindowDialog(data) {
      this.markers.forEach(item => {
        if (item.id === data.id) {
          item.animation = 'AMAP_ANIMATION_BOUNCE'
          setTimeout(() => {
            item.animation = 'AMAP_ANIMATION_NONE'
          }, 2400)
        } else {
          item.animation = 'AMAP_ANIMATION_NONE'
        }
      })
      this.center = [data.lng, data.lat]
      this.zoom = 16
      this.$nextTick(() => {
        this.currentWindow.name = data.name
        this.currentWindow.location = data.location
        this.currentWindow.position = [data.lng, data.lat]
        this.handleWindowData()
        setTimeout(() => {
          this.currentWindow.visible = true
        }, 2400)
      })
    },
    handleWindowData() {
      let th = ['天线名称']
      let td = []
      this._listDevices().then(devices => {
        devices.forEach(item => {
          let row = [item.name]
          td.push(row)
          this._listSensors(item.id).then(sensors => {
            sensors.forEach(item => {
              let index = 0
              for (let i = 0; i < th.length; i++) {
                if (th[i].indexOf(item.name) > -1) {
                  index = i
                  break
                } else if (i === th.length - 1 && th[i].indexOf(item.name) === -1) {
                  index = i + 1
                  th.push(item.name)
                }
              }
              this._deviceData(1, item.id, 1).then(data => {
                if (data.data) {
                  row[index] = data.data.displacement
                  let self = this
                  let ddf = function() {
                    self._deviceData(1, item.id, 1).then(data => {
                      Vue.set(row, index, data.data.displacement)
                    })
                  }
                  ddf()
                  this.ivs.push(setInterval(ddf, 3000))
                }
              })
            })
          })
        })
      })
      this.winData.th = th
      this.winData.td = td
    },
    showColumn(index) {
      let isShow = false
      this.winData.td.forEach(item => {
        if (item[index]) {
          isShow = true
        }
      })
      return isShow
    },
    clearIvs() {
      this.ivs.forEach(item => {
        clearInterval(item)
      })
      this.ivs = []
    },
    _getSites() {
      sites().then(response => {
        this.sites = response
        this._addMarker()
      }).catch(() => {
        this.$message({
          message: '获取监测点失败',
          type: 'danger'
        })
      })
    },
    _getSitesFilter() {
      sitesFilter(this.query).then(response => {
        this.sites = response
        this._addMarker()
      }).catch(() => {
        this.$message({
          message: '获取监测点失败',
          type: 'danger'
        })
      })
    },
    _addMarker() {
      let self = this
      this.markers = []
      this.sites.forEach(item => {
        let marker = {
          id: item.id,
          position: [item.lng, item.lat],
          animation: 'AMAP_ANIMATION_NONE',
          label: {content: item.name, offset: [10, 30]},
          events: {
            click: () => {
              self.clickMarker(item.id)
            }
          }
        }
        this.markers.push(marker)
      })
    },
    _listDevices() {
      return listDevices(this.current.id)
    },
    _listSensors(id) {
      return listSensors(id)
    },
    _deviceData(type, deviceId, rt) {
      return deviceData(type, deviceId, rt)
    }
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    Sites,
    SiteDetail
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.monitor-container
  height calc(100vh - 50px)
  .site-window
    padding 0 0 8px 8px
    .site-name
      margin 0
      font-size 16px
      font-weight bold
      color gray
    .site-location
      margin 0
      font-size 12px
      color #909399
    .site-btn
      float right
  .monitor-table
    position fixed
    width 200px
    top 50px
    right 0
    Z-index 1000
</style>
