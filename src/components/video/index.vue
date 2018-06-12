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
            <p class="name">{{video.name}}</p>
            <p class="remark">{{video.description}}</p>
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
      </div>
    </el-dialog>
  </div>
</template>

<script type='text/ecmascript-6'>
import screenfull from 'screenfull'
import Hls from 'hls.js'
import { videoPage, videoPath } from 'api/video'

export default {
  data() {
    return {
      page: 1,
      size: 100,
      videoList: [],
      video: null,
      multiList: [],
      multi: [],
      videoVisible: false,
      multiVisible: false
    }
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
    _getVideoList() {
      videoPage(this.page, this.size).then(res => {
        res.rows.forEach(item => {
          let video = {id: item.puid, name: item.name, description: item.description, checked: false}
          this.videoList.push(video)
        })
      })
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
        .name
          margin 10px
          color #606266
          font-size 16px
        .remark
          margin 10px
          color #909399
          font-size 12px
</style>
