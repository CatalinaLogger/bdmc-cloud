<template>
  <el-row :gutter="5">
    <el-col :span="12" v-for="(item, index) in rules" :key="index" v-if="item.type === '小时'">
      <el-card>
        <el-row :gutter="5">
          <el-col :span="8"><el-tag class="title">{{item.name}}</el-tag></el-col>
          <el-col :span="8"><el-tag type="danger">一级预警</el-tag></el-col>
          <el-col :span="8"><el-tag type="warning">二级预警</el-tag></el-col>
          <el-col :span="8"><el-tag type="info">上限</el-tag></el-col>
          <el-col :span="8"><el-input v-model="item.oneLess"></el-input></el-col>
          <el-col :span="8"><el-input v-model="item.twoLess"></el-input></el-col>
          <el-col :span="8"><el-tag type="info">下限</el-tag></el-col>
          <el-col :span="8"><el-input v-model="item.oneMore"></el-input></el-col>
          <el-col :span="8"><el-input v-model="item.twoMore"></el-input></el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script type="text/ecmascript-6">
import {updateSensor} from 'api/monitor'
export default {
  props: {
    rules: {
      type: Array,
      default: null
    }
  },
  methods: {
    submit() {
      this.rules.forEach(item => {
        this._updateSensor(item).then(res => {
          if (res.message === 'updated_ok') {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            return false
          } else {
            this.$message({
              message: '操作失败',
              type: 'danger'
            })
            return true
          }
        })
      })
    },
    _updateSensor(data) {
      return updateSensor(data)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.el-col
  margin-bottom 5px
  .title
    background #409EFF
    color white
.el-tag
  width 100%
  height 36px
  text-align center
  line-height 36px
</style>
