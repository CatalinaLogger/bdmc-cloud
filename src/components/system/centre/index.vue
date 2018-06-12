<template>
  <div class="center-wrapper">
      <el-form class="centre-form" :model="me" :rules="rules" label-width="65px" ref="editForm">
        <el-form-item label="用户名" prop="email" >
          <el-input v-model="me.email"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="me.password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="me.phone"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="me.name"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="me.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证" prop="id_number">
          <el-input v-model="me.id_number"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="me.home"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="float: right" @click="saveMyInfo">保存</el-button>
        </el-form-item>
      </el-form>
  </div>
</template>

<script type="text/ecmascript-6">
import {updateUser} from 'api/users'
import { mapGetters } from 'vuex'
export default {
  data() {
    const validatePhone = (rule, value, callback) => {
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!value) {
        callback(new Error('手机号码为必填项'))
      } else if (!reg.test(value)) {
        callback(new Error('手机号码格式错误'))
      } else {
        callback()
      }
    }
    const validateIDCard = (rule, value, callback) => {
      console.log(value)
      let reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
      if (value && !reg.test(value)) {
        callback(new Error('身份证号格式错误'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        email: [{required: true, message: '用户名为必填项', trigger: 'change'}],
        phone: [{required: true, trigger: 'change', validator: validatePhone}],
        name: [{required: true, message: '姓名为必填项', trigger: 'change'}],
        id_number: [{trigger: 'change', validator: validateIDCard}]
      }
    }
  },
  computed: {
    ...mapGetters([
      'me'
    ])
  },
  methods: {
    saveMyInfo() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          updateUser(this.me).then(res => {
            if (res) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: '操作失败',
                type: 'warning'
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.center-wrapper
  padding 20px
  .centre-form
    width 50%
    transition .2s
    margin 40px auto
    background #EBEEF5
    padding 40px 20px 0 20px
    border-radius 4px
    border 1px solid #EBEEF5
    &:hover
      box-shadow 2px 4px 8px 4px #afafaf
</style>
