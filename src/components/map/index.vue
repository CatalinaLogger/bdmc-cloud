<template>
  <div class="map-container">
    <div class="in-sar-bar">
      <div class="icon-button" @click="toggleInSar">
        <svg-icon icon-class="radar"></svg-icon>
      </div>
      <div class="scale-bar" v-if="inSar.show">
        <p>-40</p>
        <p>-20</p>
        <p>0</p>
        <p>20</p>
        <p>40</p>
      </div>
    </div>
    <div class="map-wrapper" id="bdMap">
      <info-window v-show="infoWindow.visible" :marker="infoWindow.marker" :options="infoWindow.options" :key="0" ref="infoWindow">
        <div class="site-window">
          <span class="site-name">{{infoWindow.data.name}}</span>
          <span class="site-location">{{infoWindow.data.location}}</span>
          <div v-if="infoWindow.data.photos.length > 0" class="site-photos" @click="showPhotos">
            <el-carousel height="200px">
              <el-carousel-item v-for="(item, index) in infoWindow.data.photos" :style="{backgroundImage:`url(${baseUrl}/${item.path})`,backgroundRepeat:'no-repeat',backgroundSize:'cover'}" :key="index">
              </el-carousel-item>
            </el-carousel>
          </div>
          <div v-else class="site-empty">暂无现场图</div>
          <el-button class="site-btn" type="success" size="mini" @click="detailVisible = true">查看详情</el-button>
        </div>
      </info-window>
      <info-window v-show="inSarWindow.visible" :map="map" :latLng="inSarWindow.latLng" :options="inSarWindow.options" :key="1" ref="inSarWindow">
        <p>[{{inSarWindow.latLng.lat}} , {{inSarWindow.latLng.lng}}]</p>
        <chart :chartData="inSarWindow.chartData" width="600px" ref="inSarChart"></chart>
      </info-window>
    </div>
    <el-dialog class="photo-detail" :visible.sync="photosVisible" :title="title" fullscreen>
      <scroll-bar class="photos-wrapper">
        <el-row :gutter="8">
          <el-col class="photo-box" :sm="sm" :xs="24" v-for="photo in infoWindow.data.photos" :key="photo.id">
            <img class="photo" :src="`${baseUrl}/${photo.path}`">
            <el-tooltip v-for="dev in photo.devices" placement="right" :key="dev.x">
              <div slot="content">
                <p>{{dev.name}}</p>
                <p v-for="sen in dev.sensors" :key="sen.name">
                  <span>{{sen.name}}</span>
                  <span>{{sen.val}}</span>
                  <span>{{sen.unit}}</span>
                </p>
              </div>
              <div class="sign" :class="{online: dev.online}" :style="{top:`${dev.x*100}%`,left:`${dev.y*100}%`}" @click="showDeviceDetail(dev)">
                <svg-icon :icon-class="formatIcon(dev.type)"></svg-icon>
              </div>
            </el-tooltip>
          </el-col>
        </el-row>
      </scroll-bar>
    </el-dialog>
    <el-dialog class="chart-detail" :visible.sync="detailVisible" :title="title" fullscreen>
      <site-detail :isShow="detailVisible" :site="currentSite" :devId="deviceId"></site-detail>
    </el-dialog>
    <sites class="site-option" :sites="sites" @query="onQueryChange" @select="selectItem"></sites>
  </div>
</template>

<script type="text/ecmascript-6">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Chart from './chart'
import Sites from './sites'
import SiteDetail from './site-detail/index'
import ScrollBar from 'base/scroll-bar'
import InfoWindow from 'base/info-window/index'
import { sites, sitesFilter, listDevices, listSensors, deviceData, getInsarList, getInsarData } from 'api/monitor'
let border = require('./border.json')
let factory = require('./markers')
L.CanvasIconLayer = factory(L)
export default {
  data() {
    return {
      baseUrl: process.env.BASE_API,
      mapUrl: process.env.MAP_URL,
      icon: require('leaflet/dist/images/marker-icon.png'),
      iconShadow: require('leaflet/dist/images/marker-shadow.png'),
      iconRetina: require('leaflet/dist/images/marker-icon-2x.png'),
      map: {}, // 地图
      markers: [], // 标记点数组
      infoWindow: {
        visible: false,
        marker: {},
        options: {
          autoClose: true,
          closeOnClick: false
        },
        data: {
          name: '',
          location: '',
          photos: []
        }
      }, // 信息弹窗数据
      inSar: {
        layer: null,
        show: false
      },
      inSarWindow: {
        visible: false,
        latLng: {},
        options: {
          maxWidth: 640,
          autoClose: true,
          closeOnClick: false
        },
        chartData: {}
      }, // Insar弹窗数据
      query: '', // 查询参数
      sites: [], // 监测点数组
      currentSite: {}, // 当前选中的监测点数据,
      deviceId: null,
      photosVisible: false,
      detailVisible: false
    }
  },
  computed: {
    title() {
      let latflag = this.currentSite.latflag === 0 ? 'E' : 'W'
      let lngflag = this.currentSite.lngflag === 0 ? 'S' : 'N'
      return `${this.currentSite.name} - ${this.currentSite.location} (${this.formatDegree(this.currentSite.lat)} ${latflag},${this.formatDegree(this.currentSite.lng)} ${lngflag})`
    },
    sm() {
      if (this.infoWindow.data.photos.length > 1) {
        return 12
      } else {
        return 24
      }
    }
  },
  created() {
    this._getSites()
  },
  mounted() {
    this.fixImageUrl()
    this.initMap()
  },
  methods: {
    /** 初始化地图 */
    initMap() {
      let street = L.tileLayer(`${this.mapUrl}/gis/ff4/nx3/{z}/{x}/{y}.png`, {
        maxZoom: 20,
        minZoom: 1
      })
      let satellite = L.tileLayer(`${this.mapUrl}/gis/ff4/nx2/{z}/{x}/{y}.png`, {
        maxZoom: 17,
        minZoom: 3
      })
      let map = L.map('bdMap', {layers: [street, satellite]}).setView([28.284, 112.543], 10)
      var baseMaps = {
        '街道图': street,
        '卫星图': satellite
      }
      L.control.layers(baseMaps).addTo(map)
      L.polygon(border, {color: 'yellow', fillOpacity: 0}).addTo(map)
      // zoom the map to the polygon
      // var popup = L.popup()
      // function onMapClick(e) {
      //   popup.setLatLng(e.latlng).setContent(e.latlng.toString()).openOn(map)
      // }
      // map.on('click', onMapClick)

      // let corner1 = L.latLng(28.535973, 111.884766) // 设置左上角经纬度
      // let bounds = L.latLngBounds(corner1, corner2) // 构建视图限制范围
      // let corner2 = L.latLng(27.885816, 112.809677) // 设置右下点经纬度
      this.map = map
    },
    /** 解决地图自带图标加载问题 */
    fixImageUrl() {
      // https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: this.iconRetina,
        iconUrl: this.icon,
        shadowUrl: this.iconShadow
      })
    },
    /** 切换InSar图层 */
    toggleInSar() {
      this.inSar.show = !this.inSar.show
      if (this.inSar.show) {
        if (this.inSar.layer) {
          this.inSar.layer.onAdd(this.map)
        } else {
          getInsarList().then(res => {
            /** 渲染inSar数据 */
            let ciLayer = L.canvasIconLayer({}).addTo(this.map)
            var markers = []
            res.forEach(item => {
              let icon = L.icon({
                iconUrl: `${this.baseUrl}/genImage?color=${item.color}`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })
              // const color = item.color
              item.insars.forEach(item => {
                var marker = L.marker([item.lat_g, item.lng_g], {icon: icon, id: item.id})
                markers.push(marker)
              })
            })
            /** 为inSar标记点添加监听事件 */
            ciLayer.addOnClickListener((e, data) => {
              let inSar = data[0].data
              getInsarData(inSar.options.id).then(res => {
                if (res.data.length > 0) {
                  let xData = []
                  let yData = []
                  res.data.forEach(item => {
                    xData.push(formatTime(item.time))
                    yData.push(item.value)
                  })
                  this.inSarWindow.latLng = L.latLng(inSar._latlng.lat, inSar._latlng.lng)
                  this.inSarWindow.chartData = {name: '历史趋势曲线', unit: 'mm', xData: xData, yData: yData}
                  this.inSarWindow.visible = true
                  setTimeout(() => {
                    this.$refs.inSarWindow.open()
                    this.$refs.inSarChart.initChart()
                  }, 10)
                }
              })
              /** 格式化unix时间戳 */
              function formatTime(time) {
                let unixtime = time
                let unixTimestamp = new Date(unixtime * 1000)
                let Y = unixTimestamp.getFullYear()
                let M = ((unixTimestamp.getMonth() + 1) > 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1))
                let D = (unixTimestamp.getDate() > 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate())
                let toDay = Y + '-' + M + '-' + D
                return toDay
              }
            })
            ciLayer.addLayers(markers)
            this.inSar.layer = ciLayer
          })
        }
      } else {
        this.inSar.layer.onRemove(this.map)
      }
    },
    /** 当搜索条件发生变化时 */
    onQueryChange(query) {
      this.query = query
      this._getSites()
    },
    /** 在右侧监测点列表中选中某个监测点时 */
    selectItem(data) {
      this.infoWindow.visible = false
      this.currentSite = data.row
      this.deviceId = null
      if (data.column === 'btn') {
        this.detailVisible = true
      } else {
        this.map.panTo([this.currentSite.lat, this.currentSite.lng])
      }
    },
    /** 打开现场图 */
    showPhotos() {
      this.photosVisible = true
    },
    /** 查看设备数据 */
    showDeviceDetail(device) {
      this.deviceId = device.device_id
      this.detailVisible = true
    },
    /** 在地图上渲染监测点 */
    _renderMarker() {
      this.markers.forEach(item => {
        item.remove()
      })
      this.markers = []
      this.sites.forEach(item => {
        let marker = L.marker([item.lat, item.lng]).addTo(this.map).on('click', () => {
          this._showInfoWindow(marker, item)
        })
        let tooltip = L.tooltip({direction: 'top', permanent: true}).setContent(item.name)
        marker.bindTooltip(tooltip).openTooltip()
        this.markers.push(marker)
      })
    },
    /** 打开监测点信息窗口 */
    _showInfoWindow(marker, site) {
      this.currentSite = site
      this.infoWindow.marker = marker
      this.infoWindow.data.name = site.name
      this.infoWindow.data.location = site.location
      this.infoWindow.data.photos = site.photos
      this.infoWindow.visible = true
      setTimeout(() => {
        this.$refs.infoWindow.open()
        this._handlePhotosData()
      }, 10)
    },
    /** 处理监测点现场图数据 */
    _handlePhotosData() {
      /** 根据监测点获取设备列表 */
      listDevices(this.currentSite.id).then(devices => {
        devices.forEach(item => {
          this.infoWindow.data.photos.forEach(photo => {
            if (photo.devices.length > 0) {
              photo.devices.forEach(dev => {
                if (item.id === dev.device_id) {
                  dev.name = item.name
                  dev.type = item.type
                  dev.online = item.online
                  dev.sensors = []
                  /** 根据设备获取监测指标 */
                  listSensors(item.id).then(res => {
                    res.forEach(sen => {
                      /** 根据检测指标获取监测数据 */
                      deviceData(1, sen.id, 1).then(res => {
                        if (res.data) {
                          dev.sensors.push({name: sen.name, unit: sen.unit, val: res.data.displacement})
                        }
                      })
                    })
                  })
                }
              })
            }
          })
        })
      })
    },
    /** 获取监测点数据 */
    _getSites() {
      if (this.query === '') {
        sites().then(response => {
          this.sites = response
          this._renderMarker()
        }).catch(() => {
          this.$message({
            message: '获取监测点失败',
            type: 'danger'
          })
        })
      } else {
        sitesFilter(this.query).then(response => {
          this.sites = response
          this._renderMarker()
        }).catch(() => {
          this.$message({
            message: '获取监测点失败',
            type: 'danger'
          })
        })
      }
    },
    /** 格式化图标名称 */
    formatIcon(value) {
      if (value === 1) {
        return 'rain' // 雨量计
      } else if (value === 2) {
        return 'water' // 土壤含水量
      } else if (value === 3) {
        return 'rent' // 裂缝计
      } else if (value === 4) {
        return 'drift' // 表面位移传感器
      } else {
        return '' // 其它
      }
    },
    /** 将度转换成为度分秒 */
    formatDegree(value) {
      value = Math.abs(value)
      var v1 = Math.floor(value)
      var v2 = Math.floor((value - v1) * 60)
      var v3 = Math.round((value - v1) * 3600 % 60)
      return v1 + '°' + v2 + '\'' + v3 + '"'
    }
  },
  components: {
    InfoWindow,
    Chart,
    Sites,
    SiteDetail,
    ScrollBar
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.map-container
  position relative
  height calc(100vh - 50px)
  .in-sar-bar
    position absolute
    top 80px
    left 12px
    width 30px
    z-index 1000
    background white
    border-radius 3px
    box-shadow 0 0 2px 2px rgba(0, 0, 0, 0.3)
    .icon-button
      width 100%
      height 30px
      font-size 20px
      text-align center
      line-height 30px
  .scale-bar
    width 100%
    height 300px
    background: linear-gradient(#7F0000, #DF0000, #FF4F00, #FFAF00, #DFFF1F, #6FFF8F, #0FFFEF, #009FFF, #003FFF, #0000CF, #00008F)
    p
      margin 0
      color white
      line-height 60px
      text-align center
  .map-wrapper
    height calc(100vh - 50px)
    background white
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
    padding 0 0 20px 2px
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
  .site-option
    position fixed
    width 200px
    top 50px
    right 0
    Z-index 1000

  @keyframes breath
    0%
      transform scale(1)
    50%
      transform scale(.8)
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
        width 30px
        height 30px
        color white
        background red
        line-height 30px
        font-size 30px
        border-radius 50%
        text-align center
        z-index 10
        animation warning 1s infinite
        &.online
          color white
          background #00ff00
          animation breath 5s infinite
      .text
        position absolute
        font-size 12px
        color white
        transform translate3d(20px, 0, 0)
</style>
