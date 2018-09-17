const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  me: state => state.user.me,
  mq: state => state.user.mq,
  warn: state => state.client.warn,
  device: state => state.client.device,
  player: state => state.client.player
}
export default getters
