<template>
  <div class="login">
    <div class="login-form">
      <div class="title-container">
        <h3 class="title">{{$t('login.title')}}</h3>
      </div>
      <el-form v-if="formType==='login'" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left" label-width="0px" autoComplete="off" :key="1">
        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" />
          </span>
          <el-input name="username" type="text" v-model="loginForm.username" :placeholder="$t('login.username')"></el-input>
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
        <el-button type="primary" style="width:100%" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>
        <div class="bottom-bar">
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          <div class="forget" @click="forgetPassword">忘记密码?</div>
        </div>
      </el-form>

      <el-form v-else class="reset-form" :model="resetForm" :rules="resetRules" ref="resetForm" label-position="left" label-width="0px" :key="2">
        <el-form-item prop="phone">
          <el-input v-model="resetForm.phone" placeholder="请输入绑定的手机号"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item prop="code">
              <el-input v-model="resetForm.code" placeholder="请输入验证码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-button class="verify-code" type="success" plain :disabled="resetForm.second ? true : false" @click="getVerifyCode">{{$t('login.verify')}} <span v-if="resetForm.second">({{resetForm.second}})</span></el-button>
          </el-col>
        </el-row>
        <el-form-item prop="password" :error="error">
          <el-input v-model="resetForm.password" type="password" placeholder="新的密码" ></el-input>
        </el-form-item>
        <el-form-item prop="testWord" :error="error">
          <el-input v-model="resetForm.testWord" type="password" placeholder="确认密码" ></el-input>
        </el-form-item>
        <el-button type="primary" style="width:100%" :loading="loading" @click.native.prevent="handleReset">确认修改</el-button>
        <div class="bottom-bar">
          <div class="forget" @click="toLogin">去登录页</div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { getCode, resetPwd } from 'api/login'
import { getUsername, getPassword, getRemember } from '@/common/utils/auth'

export default {
  data() {
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('验证码不能为空'))
      } else if (value.length !== 4) {
        callback(new Error('验证码由4位数字和字母组成'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('手机号不能为空'))
      } else if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(value)) {
        callback(new Error('手机号格式有误'))
      } else {
        callback()
      }
    }
    return {
      baseURL: process.env.BASE_API,
      timeStamp: '',
      loginForm: {
        username: getUsername(),
        password: getPassword(),
        remember: getRemember()
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      resetForm: {
        phone: '',
        code: '',
        second: 0
      },
      resetRules: {
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }],
        password: [{ required: true, trigger: 'blur', message: '请输入新的密码' }],
        testWord: [{ required: true, trigger: 'blur', message: '请再次输入密码' }]
      },
      error: '',
      loading: false,
      pwdType: 'password',
      eyeType: 'eye-off',
      formType: 'login'
    }
  },
  methods: {
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
          this.$store.dispatch('Login', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getVerifyCode() {
      this.$refs.resetForm.validateField('phone', msg => {
        if (!msg) {
          getCode(this.resetForm.phone).then(res => {
            if (res.phone) {
              this.$message.error(res.phone[0])
            } else {
              this.$refs.resetForm.clearValidate()
              this.resetForm.second = 60
              let viv = setInterval(() => {
                if (this.resetForm.second) {
                  this.resetForm.second = this.resetForm.second - 1
                } else {
                  clearInterval(viv)
                }
              }, 1000)
            }
          })
        }
      })
    },
    handleReset() {
      this.error = ''
      this.$refs.resetForm.validate(valid => {
        if (valid) {
          if (this.resetForm.password !== this.resetForm.testWord) {
            setTimeout(() => {
              this.error = '两次输入密码不一致'
            }, 10)
            return
          }
          this.loading = true
          resetPwd(this.resetForm).then(res => {
            this.loading = false
            this.$message({
              message: res.message,
              type: 'success'
            })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    forgetPassword() {
      this.formType = 'reset'
    },
    toLogin() {
      this.formType = 'login'
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  $form_bg = #ebebeb
  $dark_gray = #889aa4
  $light_gray = #eee

  .login
    display flex
    justify-content center
    align-items center
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
      z-index 100
      margin-left 60%
      width 400px
      padding 35px 35px 25px 38px
      border 1px solid $form_bg
      border-radius 10px
      background $form_bg
      &:hover
        box-shadow 2px 4px 8px 4px rgba(117, 117, 117, 0.24)
      .bottom-bar
        margin-top 5px
        .el-checkbox
          color #409eff
        .forget
          display inline-block
          float right
          cursor pointer
          color #409eff
          font-size 14px
          line-height: 19px
    .title-container
      position relative
      .title
        font-size 26px
        font-weight 400
        color #409eff
        margin 0px auto 30px auto
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
    .reset-form
      .el-input
        display inline-block
        padding-top 8px
        height 52px
        width 100%
      .verify-code
        width 124px
        height 52px
</style>
