<template>
  <div class="video-container">
    <el-row>
      <el-col :lg="4" :md="8" :sm="12" :xs="24" v-for="video in videoList" :key="video.id">
        <div class="video-box" :class="{checked: video.checked}" @click.ctrl="selectVideo(video)">
          <div class="video-card">
            <div class="play-card">
              <div class="play-button" @click.stop="playVideo(video)">
                <svg-icon class="play-icon" icon-class="play"/>
              </div>
            </div>
            <el-row><p class="name">{{video.name}}</p></el-row>
            <el-row>
              <el-col :span="12"><el-button type="primary" size="mini" @click="playTape(video)">点播</el-button></el-col>
              <el-col :span="12"><el-button class="on-off" size="mini" :type="onlineType(video.online)" :loading="video.loading" @click="switchOnline(video)">{{onlineText(video.online)}}</el-button></el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="multiple-video-dialog" v-if="multiVisible">
      <el-row :gutter="4">
        <el-col :span="12" v-for="video in multiList" :key="video.id">
          <video class="video-player" :id="video.id"></video>
        </el-col>
      </el-row>
    </div>
    <transition name="fade">
      <div class="multiple-video" v-show="multiList.length > 1">
        <el-button type="primary" @click="playMultiVideo">开启监控模式</el-button>
      </div>
    </transition>
    <el-dialog
      top="25vh"
      width="800px"
      @close="closeVideo"
      :close-on-click-modal="false"
      :visible.sync="videoVisible">
      <div class="video-wrapper">
        <video class="video-player" ref="video" controls></video>
        <el-date-picker v-if="showPicker" v-model="datePicker" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        <el-button v-if="showPicker" type="primary" @click="playPicker">播放录像</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type='text/ecmascript-6'>
import Hls from 'hls.js'
import { mapGetters } from 'vuex'
import screenfull from 'screenfull'
import { videoPage, videoPath, videoHistory } from 'api/video'
import { sendVideoOrder } from 'common/utils/client'

export default {
  data() {
    return {
      page: 1,
      size: 100,
      videoList: [],
      video: null,
      videoPicker: null,
      showPicker: false,
      datePicker: [],
      multiList: [],
      multi: [],
      videoVisible: false,
      multiVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'player'
    ])
  },
  mounted() {
    this._getVideoList()
    this.__keyDownHandle = (event) => {
      if (event.keyCode === 27) {
        this.closeMulti()
      }
    }
    window.addEventListener('keydown', this.__keyDownHandle)
  },
  methods: {
    switchOnline(video) {
      video.loading = true
      sendVideoOrder(video)
      if (video.online > 0) {
        video.online = -1
      } else {
        video.online = 2
      }
      setTimeout(() => {
        if (video.loading) {
          video.loading = false
          let msg = '监控开启失败'
          if (video.online === -1) {
            msg = '监控关闭失败'
          }
          this.$message({
            message: msg,
            type: 'warning'
          })
        }
      }, 1000 * 60 * 2)
    },
    onlineType(online) {
      if (online === -1) {
        return 'primary'
      } else if (online === 0) {
        return 'info'
      } else if (online === 1) {
        return 'success'
      } else if (online === 2) {
        return 'primary'
      }
    },
    onlineText(online) {
      if (online === -1) {
        return '关机中'
      } else if (online === 0) {
        return '已关机'
      } else if (online === 1) {
        return '运行中'
      } else if (online === 2) {
        return '开机中'
      }
    },
    selectVideo(v) {
      if (this.multiList.length < 4 && v.checked === false) {
        this.multiList.push(v)
        v.checked = !v.checked
      } else {
        let index = this.multiList.indexOf(v)
        if (index !== -1) {
          this.multiList.splice(index, 1)
          v.checked = !v.checked
        }
      }
    },
    playMultiVideo() { /** 监控模式打开摄像头 */
      this.multiVisible = true
      screenfull.toggle()
      this.multiList.forEach(v => {
        videoPath(v.id).then(res => {
          let url = res.response.url
          let video = document.getElementById(v.id)
          if (Hls.isSupported()) {
            let hls = new Hls()
            hls.loadSource(url)
            hls.attachMedia(video)
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
              video.play()
            })
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = v.src
            video.addEventListener('loadedmetadata', function() {
              video.play()
            })
          }
        })
      })
    },
    closeVideo() {
      this.video.destroy()
    },
    closeMulti() {
      this.multiVisible = false
    },
    playVideo(v) { /** 打开单个摄像头 */
      this.showPicker = false
      this.videoVisible = true
      videoPath(v.id).then(res => {
        let url = res.response.url
        let video = this.$refs.video
        if (Hls.isSupported()) {
          let hls = new Hls()
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play()
          })
          this.video = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = v.src
          video.addEventListener('loadedmetadata', function() {
            video.play()
          })
        }
      })
    },
    playTape(v) {
      this.showPicker = true
      this.videoVisible = true
      this.videoPicker = v
    },
    playPicker() {
      let self = this
      let begin = this.datePicker[0].getTime() / 1000
      let end = this.datePicker[1].getTime() / 1000
      videoHistory(this.videoPicker.id, begin, end).then(res => {
        let url = res.response.url
        let video = this.$refs.video
        if (Hls.isSupported()) {
          let hls = new Hls()
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play()
          })
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.type === 'networkError') {
              self.$message({
                message: '所选时段无录像，请重新选择',
                type: 'error'
              })
            } else {
              self.$message({
                message: '播放失败',
                type: 'error'
              })
            }
          })
          this.video = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = this.videoPicker.src
          video.addEventListener('loadedmetadata', function() {
            video.play()
          })
        }
      })
    },
    _getVideoList() {
      videoPage(this.page, this.size).then(res => {
        res.rows.forEach(item => {
          let info = item.name.split('-')
          let video = {id: item.puid, name: info[0], phone: info[1], description: item.description, online: parseInt(item.online), loading: false, checked: false}
          this.videoList.push(video)
        })
      })
    }
  },
  watch: {
    player(val) {
      let video = this.videoList.filter(item => {
        return item.name === val.phoneNumber
      })[0]
      video.loading = false
      if (val.rc === true) {
        if (video.online === -1) {
          video.online = 0
        } else {
          video.online = 1
        }
      } else {
        if (video.online === -1) {
          video.online = 1
        } else {
          video.online = 0
        }
      }
    }
  }
}
</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>

.video-container
  position relative
  background #e6e6e6
  .video-wrapper
    padding-bottom 20px
    .video-player
      width 100%
      margin-bottom 1px
  .multiple-video
    position fixed
    bottom 0
    left 40%
    width 400px
    height 80px
    z-index 100
    .el-button
      width 100%
      height 60px
      font-size 20px
    &.fade-enter-active, &.fade-leave-active
      transition all .5s
    &.fade-enter, &.fade-leave-to
      transform: translateY(100%)
  .multiple-video-dialog
    position fixed
    top 0
    right 0
    bottom 0
    left 0
    background black
    z-index 1000000
    .el-row
      padding 0
      .el-col
        padding 0
        .video-player
          width 100%
          margin 0
          padding 0
.el-row
  padding 10px
  .el-col
    padding 10px 10px
    .video-box
      width 100%
      overflow hidden
      background white
      border-radius 10px
      &.checked
        box-shadow 0 0 8px 4px #ffb600
        &:hover
          box-shadow 0 0 8px 4px #ffb600
      &:hover
        box-shadow 0 0 8px 4px rgba(0, 0, 0, 0.3)
      .video-card
        width 100%
        height 100%
        .play-card
          padding 20px
          text-align center
          background #409eff
          .play-button
            margin 0 auto
            width 60px
            .play-icon
              color white
              font-size 60px
              &:hover
                transform scale(1.4)
        .el-row
          margin 0
          padding 0
          .name
            margin 10px 10px 0 10px
            color #606266
            font-size 16px
          .on-off
            float right
</style>
