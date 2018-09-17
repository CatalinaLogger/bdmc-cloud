import request from 'common/utils/request'

export function alarmsDevice(pn, ps, deviceId, query, level, date) {
  return request({
    url: '/alarmsDevice',
    method: 'get',
    params: {
      pn,
      ps,
      id: deviceId,
      id2: query,
      lvl: level,
      starttime: date[0],
      endtime: date[1]
    }
  })
}

export function alarmsSensor(pn, ps, deviceId, query, level, date) {
  return request({
    url: '/alarmsSensor',
    method: 'get',
    params: {
      pn,
      ps,
      id: deviceId,
      id2: query,
      lvl: level,
      starttime: date[0],
      endtime: date[1]
    }
  })
}

export function alarmsCamera(pn, ps, deviceId, query, level, date) {
  return request({
    url: '/alarmsCamera',
    method: 'get',
    params: {
      pn,
      ps,
      id: deviceId,
      id2: query,
      lvl: level,
      starttime: date[0],
      endtime: date[1]
    }
  })
}

export function handleDeviceAlarm(formData) {
  return request({
    url: '/handleDeviceAlarm',
    method: 'post',
    data: {
      id: formData.id,
      conclusion: formData.result
    }
  })
}

export function handleSensorAlarm(formData) {
  return request({
    url: '/handleSensorAlarm',
    method: 'post',
    data: {
      id: formData.id,
      conclusion: formData.result
    }
  })
}

export function handleCameraAlarm(formData) {
  return request({
    url: '/handleCameraAlarm',
    method: 'post',
    data: {
      id: formData.id,
      conclusion: formData.result
    }
  })
}
