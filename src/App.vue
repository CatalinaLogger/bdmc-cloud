<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { refresh } from 'api/login'
import { setToken } from 'common/utils/auth'
import { setUserInfo } from 'common/utils/cache'
import { initMqtt, responseMqtt } from 'common/utils/client'

export default {
  data() {
    return {
      init: false
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'me'
    ])
  },
  created() {
    this.initEnvironment()
  },
  methods: {
    initEnvironment() {
      if (!this.init && this.token) {
        initMqtt()
        let topic = this.me.type === 1 ? 'a/#' : `a/${this.me.id}`
        responseMqtt(topic, (res) => {
          // this.$notify({
          //   title: '警告',
          //   message: res.msg,
          //   type: 'warning',
          //   duration: 0
          // })
          this.setStoreWarn(res)
        })
        responseMqtt('responseVideo/#', (res) => {
          console.log(res)
          this.setStoreVideo(res)
        })
        responseMqtt('responseDevice/#', (res) => {
          this.setStoreDevice(res)
        })
        /** 刷新Token保持在线状态 */
        setInterval(() => {
          refresh().then(response => {
            console.log(response)
            setToken(`${response.token_type} ${response.access_token}`)
            setUserInfo(response.me)
            this.setStoreToken(`${response.token_type} ${response.access_token}`)
            this.setStoreMe(response.me)
          })
        }, 1000 * 60 * 50)
        this.init = true
      }
    },
    ...mapMutations({
      setStoreToken: 'SET_TOKEN',
      setStoreMe: 'SET_ME',
      setStoreWarn: 'SET_WARN',
      setStoreVideo: 'SET_VIDEO',
      setStoreDevice: 'SET_DEVICE'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    token() {
      this.initEnvironment()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
