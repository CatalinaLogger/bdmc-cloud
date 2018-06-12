import { login, otherLogin, logout } from 'api/login'
// import { handleMqttData } from 'api/mqtt'
import { getToken, setToken, removeToken, getUsername, setUsername, getPassword, setPassword } from 'common/utils/auth'
import { getUserInfo, setUserInfo } from 'common/utils/cache'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    roles: [],
    me: getUserInfo(),
    mq: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ME: (state, me) => {
      state.me = me
    },
    SET_MQ: (state, mq) => {
      state.mq = mq
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
            /**
            handleMqttData(response.me, (mq) => {
              commit('SET_MQ', mq)
            })
            */
            setUsername(username)
            setPassword(userInfo.password)
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

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve) => {
        commit('SET_ROLES', ['admin', 'user'])
        setInterval(() => {
          login(getUsername(), getPassword()).then(response => {
            commit('SET_TOKEN', `${response.token_type} ${response.access_token}`)
          })
        }, 1000 * 60 * 50)
        resolve()
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
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
