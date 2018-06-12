<template>
  <div class="login">
    <div class="login-form" >
      <div class="change-login-type" @click.stop="changeLoginType">
        <div class="icon-box" :class="loginType">
          <svg-icon :icon-class="loginType"/>
        </div>
      </div>
      <div class="title-container" >
        <h3 class="title">{{$t('login.title')}}</h3>
      </div>
      <el-form v-if="loginType === 'phone'" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left" label-width="0px" autocomplete="off" :key="1">
        <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
          <el-input name="username" type="text" v-model="loginForm.username" max="20" :placeholder="$t('login.username')"></el-input>
        </el-form-item>
        <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"></svg-icon>
        </span>
          <el-input name="password" :type="pwdType"  v-model="loginForm.password" :placeholder="$t('login.password')"
                    @keyup.enter.native="handleLogin"></el-input>
          <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="eyeType"/>
        </span>
        </el-form-item>
        <el-form-item :error="error.login">
          <el-button type="primary" style="width:100%" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>
        </el-form-item>
      </el-form>

      <el-form v-else class="other-form" :model="otherForm" :rules="otherRules" ref="otherForm" label-position="left" label-width="0px" :key="2">
        <el-form-item prop="phone" :error="error.phone">
          <el-input v-model="otherForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item prop="code" :error="error.code" ref="otherFormCode">
              <el-input v-model="otherForm.code" placeholder="请输入验证码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-button class="verify-code" type="success" plain :disabled="otherForm.second ? true : false" @click="getVerifyCode">{{$t('login.verify')}} <span v-if="otherForm.second">({{otherForm.second}})</span></el-button>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button class="verify-login" style="width:100%" :loading="loading" type="primary" @click.native.prevent="handleOtherLogin">{{$t('login.logIn')}}</el-button>
        </el-form-item>
      </el-form>
      <div class="download">为保障数据安全，请在初次使用时下载安装<a class="stress" href="https://cloud.bdsmc.net:8443/bdmcCA.zip" target="_blank">数字证书</a>。</div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import LangSelect from 'base/lang-select'
import {getPWD} from 'api/login'

export default {
  data() {
    const validatePhone = (rule, value, callback) => {
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!value) {
        callback(new Error('手机号码不能为空'))
      } else if (!reg.test(value)) {
        callback(new Error('手机号码格式错误'))
      } else {
        callback()
      }
    }
    return {
      loginType: 'phone',
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      loading: false,
      pwdType: 'password',
      eyeType: 'eye-off',
      otherVisible: false,
      otherForm: {
        phone: '',
        code: '',
        second: 0
      },
      otherRules: {
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        code: [{ required: true, message: '请先填写验证码', trigger: 'blur' }]
      },
      error: {
        login: '',
        phone: '',
        code: ''
      }
    }
  },
  methods: {
    changeLoginType() {
      if (this.loginType === 'login') {
        this.loginType = 'phone'
      } else {
        this.loginType = 'login'
      }
    },
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
        this.eyeType = 'eye-on'
      } else {
        this.pwdType = 'password'
        this.eyeType = 'eye-off'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.error = {login: '', phone: '', code: ''}
          this.$store.dispatch('Login', this.loginForm).then(res => {
            this.loading = false
            if (res) {
              this.error.login = '请输入正确的用户名和密码'
            } else {
              this.$router.push({ path: '/' })
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    showOtherDialog() {
      this.otherVisible = true
    },
    getVerifyCode() {
      let error = false
      this.$refs.otherForm.validateField('phone', msg => {
        if (msg) {
          error = true
        }
      })
      if (!this.otherForm.phone || error) {
        return
      }
      this.error = {login: '', phone: '', code: ''}
      getPWD(this.otherForm.phone).then(res => {
        if (res.phone) {
          this.error.phone = res.phone[0]
        } else {
          this.$refs.otherFormCode.resetField()
          this.otherForm.second = 60
          let viv = setInterval(() => {
            if (this.otherForm.second) {
              this.otherForm.second = this.otherForm.second - 1
            } else {
              clearInterval(viv)
            }
          }, 1000)
        }
      })
    },
    handleOtherLogin() {
      this.$refs.otherForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.error = {login: '', phone: '', code: ''}
          this.$store.dispatch('OtherLogin', this.otherForm).then(res => {
            this.loading = false
            if (res) {
              this.error.code = '验证码错误'
            } else {
              this.$router.push({ path: '/' })
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  },
  components: {
    LangSelect
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  $form_bg = #ebebeb
  $dark_gray = #889aa4
  $light_gray = #eee

  .login
    position fixed
    width 100%
    height 100%
    background-image url("bdmc.jpg")
    background-repeat no-repeat
    background-size cover
    input:-webkit-autofill
      -webkit-box-shadow 0 0 0px 1000px #ffffff inset !important
      -webkit-text-fill-color #000000 !important
    input
      background transparent
      border 0px
      -webkit-appearance none
      border-radius 0px
      padding 12px 5px 12px 15px
      color #000000
      height 47px
    .login-form
      position fixed
      z-index 100
      top 20%
      right 10%
      width 400px
      padding 35px
      border-radius 10px
      background $form_bg
      overflow hidden
      &:hover
        box-shadow 2px 4px 8px 4px #bebebe
      .change-login-type
        position absolute
        top -60px
        left -60px
        height 120px
        width 120px
        background #909399
        transform rotate(45deg)
        overflow hidden
        .icon-box
          position absolute
          width 120px
          height 120px
          color white
          padding-top 60px
          padding-left 60px
          background #909399
          transform rotate(-45deg)
          font-size 45px

      .title-container
        position relative
        .title
          font-size 26px
          font-weight 400
          color #409eff
          margin 0px auto 40px auto
          text-align center
          font-weight bold
        .set-language
          position absolute
          color $dark_gray
          top 0px
          right 0px
      .el-form-item
        border 1px solid $form_bg
        border-radius 5px
        background white
      .svg-container
        padding 6px 5px 6px 15px
        color $dark_gray
        vertical-align middle
        width 30px
        display inline-block
        &_login
          font-size 20px
      .show-pwd
        position absolute
        right 10px
        top 7px
        font-size 16px
        color $dark_gray
        cursor pointer
        user-select none
      .el-input
        display inline-block
        height 47px
        width 85%
      .other-form
        .el-input
          display inline-block
          padding-top 8px
          height 52px
          width 100%
        .verify-code
          width 124px
          height 52px
      .download
        position absolute
        bottom 0
        left 0
        width 100%
        text-align center
        font-size 14px
        line-height 30px
        .stress
          color #409eff
          font-weight bold
</style>
