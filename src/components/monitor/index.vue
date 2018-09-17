<template>
  <div class="monitor-container">
    <el-amap class="amap-demo" vid="amapDemo" :amap-manager="amapManager" :center="center" :zoom="zoom" :plugin="plugin" ref="map">
      <el-amap-marker v-for="(marker, index) in markers" :position="marker.position" :events="marker.events" :animation="marker.animation" :label="marker.label" :key="index"></el-amap-marker>
      <el-amap-info-window :position="currentWindow.position" :visible="currentWindow.visible" :events="currentWindow.events" :offset="currentWindow.offset" v-if="currentWindow.visible">
        <template>
          <div class="site-window">
            <span class="site-name">{{currentWindow.name}}</span>
            <span class="site-location">{{currentWindow.location}}</span>
            <div v-if="currentWindow.photos.length > 0" class="site-photos" @click="showPhotosDialog">
              <el-carousel height="200px">
                <el-carousel-item v-for="(item, index) in currentWindow.photos" :style="{backgroundImage:`url(${baseUrl}/${item.path})`,backgroundRepeat:'no-repeat',backgroundSize:'cover'}" :key="index">
                </el-carousel-item>
              </el-carousel>
            </div>
            <div v-else class="site-empty">暂无现场图</div>
            <el-button class="site-btn" type="success" size="mini" @click="dialogVisible = true">查看详情</el-button>
          </div>
        </template>
      </el-amap-info-window>
      <el-amap-info-window :position="InSarWindow.position" :visible="InSarWindow.visible" :events="InSarWindow.events" v-if="InSarWindow.visible">
        <template>
          <chart :chartData="InSarWindow.chartData" width="600px"></chart>
        </template>
      </el-amap-info-window>
    </el-amap>
    <sites class="monitor-table" :sites="sites" @query="onQueryChange" @select="selectItem"></sites>
    <el-dialog class="chart-detail" :visible.sync="dialogVisible" :title="title" fullscreen>
      <site-detail :isShow="dialogVisible" :site="current" :devId="devId"></site-detail>
    </el-dialog>
    <el-dialog class="photo-detail" :visible.sync="photosVisible" :title="title" fullscreen>
      <scroll-bar class="photos-wrapper">
        <el-row :gutter="8">
          <el-col class="photo-box" :sm="sm" :xs="24" v-for="photo in currentWindow.photos" :key="photo.id">
            <img class="photo" :src="`${baseUrl}/${photo.path}`">
            <el-tooltip v-for="dev in photo.devices" :content="dev.name" placement="right" :key="dev.x">
              <div class="sign" :class="{online: dev.online}" :style="{top:`${dev.x*100}%`,left:`${dev.y*100}%`}" @click="showDevicesChart(dev)"></div>
            </el-tooltip>
          </el-col>
        </el-row>
      </scroll-bar>
    </el-dialog>
    <div class="switch-button" @click="toggleInSar">
      <svg-icon icon-class="radar"></svg-icon>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import ScrollBar from 'base/scroll-bar'
import Chart from './chart'
import Sites from './sites'
import SiteDetail from './site-detail/index'
import { AMapManager } from 'vue-amap'
import { mapGetters } from 'vuex'
import { sites, getInsarList, getInsarData, sitesFilter, listDevices, listSensors, deviceData } from 'api/monitor'
let amapManager = new AMapManager()
export default {
  name: 'monitor',
  data() {
    let self = this
    return {
      baseUrl: process.env.BASE_API,
      dialogVisible: false,
      photosVisible: false,
      query: '',
      sites: [],
      current: {},
      devId: null,
      amapManager,
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
        location: '',
        photos: []
      },
      InSar: false,
      Point: [],
      InSarWindow: {
        position: [0, 0],
        visible: false,
        chartData: {},
        events: {
          close() {
            self.InSarWindow.visible = false
          }
        }
      },
      winData: {},
      ivs: []
    }
  },
  computed: {
    title() {
      let latflag = this.current.latflag === 0 ? 'E' : 'W'
      let lngflag = this.current.lngflag === 0 ? 'S' : 'N'
      return `${this.current.name} - ${this.current.location} (${this.formatDegree(this.current.lat)} ${latflag},${this.formatDegree(this.current.lng)} ${lngflag})`
    },
    sm() {
      if (this.currentWindow.photos.length > 1) {
        return 12
      } else {
        return 24
      }
    },
    ...mapGetters([
      'mq'
    ])
  },
  created() {
    this._getSites()
  },
  deactivated() {
    this.clearIvs()
    this.currentWindow.visible = false
    this.dialogVisible = false
    this.photosVisible = false
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
      this.devId = null
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
      this.devId = null
      this.showWindowDialog(this.current)
    },
    showWindowDialog(data) {
      this.markers.forEach(item => {
        if (item.id === data.id) {
          item.animation = 'AMAP_ANIMATION_BOUNCE'
          setTimeout(() => {
            item.animation = 'AMAP_ANIMATION_NONE'
          }, 1200)
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
        this.currentWindow.photos = data.photos
        this.handlePhotosData()
        setTimeout(() => {
          this.currentWindow.visible = true
        }, 1200)
      })
    },
    handlePhotosData() {
      this._listDevices().then(devices => {
        devices.forEach(item => {
          this.currentWindow.photos.forEach(photo => {
            if (photo.devices.length > 0) {
              photo.devices.forEach(dev => {
                if (item.id === dev.device_id) {
                  dev.name = item.name
                  dev.online = item.online
                }
              })
            }
          })
        })
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
    showPhotosDialog() {
      this.photosVisible = true
    },
    showDevicesChart(dev) {
      this.devId = dev.device_id
      this.dialogVisible = true
    },
    formatDegree(value) {
      // 将度转换成为度分秒
      value = Math.abs(value)
      var v1 = Math.floor(value)
      var v2 = Math.floor((value - v1) * 60)
      var v3 = Math.round((value - v1) * 3600 % 60)
      return v1 + '°' + v2 + '\'' + v3 + '"'
    },
    toggleInSar2() {
      let map = amapManager.getMap()
      console.log(new AMap.Size(11, 11))
      // 样式对象数组
      var styleObjectArr = [
        {
          url: 'http://a.amap.com/jsapi_demos/static/images/mass0.png',
          anchor: new AMap.Pixel(6, 6),
          size: new AMap.Size(11, 11)
        },
        {
          url: 'http://a.amap.com/jsapi_demos/static/images/mass0.png',
          anchor: new AMap.Pixel(6, 6),
          size: new AMap.Size(11, 11)
        }
      ]

      // 实例化 AMap.MassMarks
      var massMarks = new AMap.MassMarks({
        zIndex: 5, // 海量点图层叠加的顺序
        zooms: [3, 19], // 在指定地图缩放级别范围内展示海量点图层
        style: styleObjectArr // 多种样式对象的数组
      })

      // 设置了样式索引的点标记数组
      var data = [{
        lnglat: [113.00, 28.21],
        name: 'beijing',
        id: 1,
        style: 0 // 该数据的样式取值styleObjectArr对应的样式索引
      }, {
        lnglat: [113.00, 29.21],
        name: 'beijing',
        id: 1,
        style: 1
      }
      ]
      // 将数组设置到 massMarks 图层
      massMarks.setData(data)
      // 将 massMarks 添加到地图实例
      massMarks.setMap(map)
    },
    toggleInSar() {
      let self = this
      let map = amapManager.getMap()
      // 加载PointSimplifier，loadUI的路径参数为模块名中 'ui/' 之后的部分
      AMapUI.loadUI(['misc/PointSimplifier'], function (PointSimplifier) {
        if (!PointSimplifier.supportCanvas) {
          alert('当前环境不支持 Canvas！')
          return
        }
        self.InSar = !self.InSar
        if (self.InSar) {
          if (self.Point.length > 0) {
            self.Point.forEach(item => {
              item.show()
            })
          } else {
            // 启动页面
            initPage(PointSimplifier)
          }
        } else {
          self.Point.forEach(item => {
            item.hide()
          })
        }
      })

      function initPage(PointSimplifier) {
        getInsarList().then(res => {
          res.forEach(item => {
            let color = `rgba(${parseInt(item.color.substring(2, 4), 16)}, ${parseInt(item.color.substring(4, 6), 16)}, ${parseInt(item.color.substring(6, 8), 16)}, ${parseInt(item.color.substring(0, 2), 16)})`
            // 创建组件实例
            let pointSimplifierIns = new PointSimplifier({
              map: map, // 关联的map
              compareDataItem: function (a, b, aIndex, bIndex) {
                // 数据源中靠后的元素优先，index大的排到前面去
                return aIndex > bIndex ? -1 : 1
              },
              getPosition: function (dataItem) {
                // 返回数据项的经纬度，AMap.LngLat实例或者经纬度数组
                return dataItem.position
              },
              getHoverTitle: function (dataItem, idx) {
                // 返回数据项的Title信息，鼠标hover时显示
                return '序号: ' + idx
              },
              renderOptions: {
                // 点的样式
                pointStyle: {
                  content: 'rect',
                  fillStyle: color // 蓝色填充
                }
              }
            })
            // 随机创建一批点，仅作示意
            let data = createPoints(item.insars)

            // 设置数据源，data需要是一个数组
            pointSimplifierIns.setData(data)

            // 监听事件
            pointSimplifierIns.on('pointClick', function(e, record) {
              getInsarData(record.data.id).then(res => {
                if (res.data.length > 0) {
                  let xData = []
                  let yData = []
                  res.data.forEach(item => {
                    xData.push(formatTime(item.time))
                    yData.push(item.value)
                  })
                  self.InSarWindow.chartData = { name: '', xData: xData, yData: yData }
                  self.InSarWindow.position = record.data.position
                  self.InSarWindow.visible = true
                }
              })
            })
            self.Point.push(pointSimplifierIns)
          })
        })
      }

      // 仅作示意
      function createPoints(points) {
        var data = []
        points.forEach(item => {
          data.push({
            id: item.id,
            position: [
              item.lng_g,
              item.lat_g
            ]
          })
        })
        return data
      }

      function formatTime(time) {
        let unixtime = time
        let unixTimestamp = new Date(unixtime * 1000)
        let Y = unixTimestamp.getFullYear()
        let M = ((unixTimestamp.getMonth() + 1) > 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1))
        let D = (unixTimestamp.getDate() > 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate())
        let toDay = Y + '-' + M + '-' + D
        return toDay
      }
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
    },
    mq(warn) {
      this.$message.error(warn.msg)
      if (this.currentWindow) {
        this.currentWindow.photos.forEach(photo => {
          if (photo.devices.length > 0) {
            photo.devices.forEach(dev => {
              if (warn.id === dev.device_id) {
                if (dev.online !== warn.online) {
                  dev.online = warn.online
                }
              }
            })
          }
        })
      }
    }
  },
  components: {
    Chart,
    Sites,
    SiteDetail,
    ScrollBar
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.monitor-container
  position relative
  height calc(100vh - 50px)
  .switch-button
    position absolute
    top 12px
    left 80px
    height 47px
    width 47px
    z-index 10
    color #ccc
    cursor pointer
    font-size 30px
    text-align center
    line-height 46px
    background white
    border-radius 50%
    box-shadow 0 0 1px 1px #787878
    &:hover
      color #409eff
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
    .site-photos
      width 300px
      height 200px
    .site-empty
      font-size 12px
      line-height 30px
      color #909399
    .site-btn
      float right
  .monitor-table
    position fixed
    width 200px
    top 50px
    right 0
    Z-index 1000

@keyframes breath
  0%
    transform scale(1)
  50%
    transform scale(.5)
  100%
    transform scale(1)

@keyframes warning
  0%
    opacity 1
  50%
    opacity 0
  100%
    opacity 1

.photos-wrapper
  width calc(100vw - 40px)
  height calc(100vh - 104px)
  background white
  overflow hidden
  .photo-box
    position relative
    .photo
      width 100%
    .sign
      position absolute
      width 15px
      height 15px
      background red
      border-radius 50%
      box-shadow 0 0 20px red
      z-index 10
      animation warning 1s infinite
      &.online
        background #00ff00
        box-shadow 0 0 20px #00ff00
        animation breath 5s infinite
    .text
      position absolute
      font-size 12px
      color white
      transform translate3d(20px, 0, 0)
</style>
