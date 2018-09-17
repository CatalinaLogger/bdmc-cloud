import request from 'common/utils/request'

export function login(username, password) {
  return request({
    url: '/login',
    method: 'get',
    params: {
      email: username,
      password
    }
  })
}

export function refresh() {
  return request({
    url: '/refresh',
    method: 'get'
  })
}

export function otherLogin(phone, code) {
  return request({
    url: '/login2',
    method: 'post',
    data: {
      phone: phone,
      password: code
    }
  })
}

export function getPWD(phone) {
  return request({
    url: '/getPWD',
    method: 'post',
    data: {phone}
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
