import request from 'common/utils/request'

export function listUsers() {
  return request({
    url: '/listUsers',
    method: 'get'
  })
}

export function updateUser(data) {
  return request({
    url: '/updateUser',
    method: 'get',
    params: data
  })
}

export function addUser(data) {
  return request({
    url: '/addUser',
    method: 'get',
    params: data
  })
}

export function deleteUser(data) {
  return request({
    url: '/delUser',
    method: 'get',
    params: data
  })
}

export function listPois() {
  return request({
    url: '/listPois',
    method: 'get'
  })
}

export function assignPoi(uid, sid) {
  return request({
    url: '/assignPoi',
    method: 'post',
    data: {
      id: uid,
      poiId: sid
    }
  })
}
