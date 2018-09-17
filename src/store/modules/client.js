const client = {
  state: {
    warn: {}, // 报警信息
    device: {}, // 设备控制信息
    player: {} // 视频控制反馈
  },
  mutations: {
    SET_WARN: (state, warn) => {
      state.warn = warn
    },
    SET_DEVICE: (state, device) => {
      state.device = device
    },
    SET_VIDEO: (state, player) => {
      state.player = player
    }
  }
}

export default client
