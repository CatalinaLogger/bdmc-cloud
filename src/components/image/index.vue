<template>
  <div class="image-container">
    <div class="image-wrapper">
      <div class="image-item" v-for="item in imageList" :key="item.id" @click="showImages(item)">
        <img class="image-box" :src="`${baseUrl}${item.url}`">
        <div class="image-desc" v-if="deviceList.length > 0">{{mateName(item.id)}}</div>
      </div>
      <div class="image-item"></div>
      <div class="image-item"></div>
    </div>
    <el-dialog :visible.sync="imageVisible" fullscreen :show-close="false">
      <div class="header-bar" slot="title">
        <div class="title">
          {{mateName(current.id)}}
        </div>
        <div class="right-option">
          <el-date-picker
            v-model="date"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
          <el-button-group>
            <el-button type="primary" icon="el-icon-search" @click="selectImages"></el-button>
            <el-button type="danger" icon="el-icon-close" @click="closeImages"></el-button>
          </el-button-group>
        </div>
      </div>
      <img class="images" v-for="item in images" :src="`${baseUrl}${item}`" :key="item">
    </el-dialog>
  </div>
</template>

<script type='text/ecmascript-6'>
import { videoPage, getVideopic, getVideoPicByDate } from 'api/video'

export default {
  data() {
    return {
      baseUrl: 'http://cloud.bdsmc.net:8088',
      deviceList: [],
      imageList: [],
      imageVisible: false,
      current: {},
      date: new Date(),
      images: []
    }
  },
  mounted() {
    this._getVideoList()
  },
  methods: {
    showImages(image) {
      this.current = image
      this.imageVisible = true
      this.selectImages()
    },
    selectImages() {
      getVideoPicByDate(this.current.id, this.date.getTime() / 1000).then(res => {
        if (res.error) {
          this.images = []
          this.$message.error(res.error)
        } else {
          this.images = res
        }
      })
    },
    closeImages() {
      this.imageVisible = false
    },
    mateName(id) {
      try {
        return this.deviceList.filter(item => {
          return item.id === id
        })[0].name
      } catch (e) {
      }
    },
    _getVideoList() {
      videoPage(1, 1000).then(res => {
        res.rows.forEach(item => {
          this.deviceList.push({id: item.puid, name: item.name})
        })
      })
      getVideopic().then(res => {
        this.imageList = res
      })
    }
  }
}
</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>
.image-wrapper
  padding 10px
  display flex
  flex-wrap wrap
  align-content flex-start
  width 100%
  min-height calc(100vh - 50px)
  background #efefef
  .image-item
    position relative
    flex-grow 1
    margin 10px
    min-width 400px
    height 225px
    background gray
    overflow hidden
    &:nth-last-child(2)
    &:last-child
      margin-top 0
      margin-bottom 0
      height 0px
    .image-box
      position absolute
      width 100%
      transition all .5s
      &:hover
        transform scale(1.1)
    .image-desc
      position absolute
      left 5px
      bottom 5px
      color yellow
      font-size 12px
      font-weight bold
.header-bar
  display flex
  align-items center
  padding 20px
  width 100%
  height 50px
  background rgb(84, 92, 100)
  .title
    color white
    font-size 20px
  .right-option
    flex-grow 1
    text-align right
    .el-button-group
      margin-top -2px
.images
  width 100%
</style>
