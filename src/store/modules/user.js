import { login, otherLogin, logout } from 'api/login'
import { getToken, setToken, removeToken, setUsername, setPassword, removePassword, setRemember } from '@/common/utils/auth'
import { getUserInfo, setUserInfo } from 'common/utils/cache'

const user = {
  state: {
    token: getToken(),
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    me: getUserInfo()
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ME: (state, me) => {
      state.me = me
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          if (!response.token_type) {
            resolve(response)
          } else {
            setToken(`${response.token_type} ${response.access_token}`)
            setUserInfo(response.me)
            commit('SET_TOKEN', `${response.token_type} ${response.access_token}`)
            commit('SET_ME', response.me)
            setUsername(userInfo.username)
            if (userInfo.remember) {
              setPassword(userInfo.password)
              setRemember(userInfo.remember)
            } else {
              removePassword()
              setRemember(userInfo.remember)
            }
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 短信登录
    OtherLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        otherLogin(userInfo.phone, userInfo.code).then(response => {
          if (!response.token_type) {
            resolve(response)
          } else {
            setToken(`${response.token_type} ${response.access_token}`)
            setUserInfo(response.me)
            commit('SET_TOKEN', `${response.token_type} ${response.access_token}`)
            commit('SET_ME', response.me)
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
