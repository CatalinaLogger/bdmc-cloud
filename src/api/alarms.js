import request from 'common/utils/request'

export function listAlarms() {
  return request({
    url: '/listAlarms',
    method: 'get',
    params: {
      all: true
    }
  })
}

export function handleAlarm(id, content) {
  return request({
    url: '/handleAlarm',
    method: 'post',
    data: {
      id,
      conclusion: content
    }
  })
}
