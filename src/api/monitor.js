import request from 'common/utils/request'

export function getMapInfo() {
  return request({
    url: '/getMapInfo',
    method: 'get'
  })
}

export function sites() {
  return request({
    url: '/listPois',
    method: 'get'
  })
}

export function getInsarList() {
  return request({
    url: '/insar',
    method: 'get'
  })
}

export function getInsarData(id) {
  return request({
    url: '/insarData',
    method: 'get',
    params: {
      id
    }
  })
}

export function sitesFilter(query) {
  return request({
    url: `/searchPoi/${query}`,
    method: 'get'
  })
}

export function listDevices(id) {
  return request({
    url: '/listDevices',
    method: 'get',
    params: {
      id
    }
  })
}

export function listSensors(id) {
  return request({
    url: '/listSensors',
    method: 'get',
    params: {
      id
    }
  })
}

export function deviceData(type, deviceId, rt) {
  return request({
    url: '/devicedata',
    method: 'get',
    params: {
      type,
      device_id: deviceId,
      rt
    }
  })
}

export function listAlarms(id) {
  return request({
    url: '/listAlarms',
    method: 'get',
    params: {
      id
    }
  })
}

export function listRegs(id) {
  return request({
    url: '/listRegs',
    method: 'get',
    params: {
      id
    }
  })
}

export function listKeeps(id) {
  return request({
    url: '/listMaintenances',
    method: 'get',
    params: {
      id
    }
  })
}

export function addKeep(id, content) {
  return request({
    url: `/addMaintenance/${id}`,
    method: 'post',
    data: {
      content
    }
  })
}

export function updateSensor({id, oneLess, oneMore, twoLess, twoMore} = {}) {
  console.log(id, oneLess, oneMore, twoLess, twoMore)
  return request({
    url: 'updateSensor',
    method: 'post',
    data: {
      id: id,
      up1: oneLess,
      down1: oneMore,
      up2: twoLess,
      down2: twoMore
    }
  })
}

export function listDeviceData({id, date, lastId} = {}) {
  return request({
    url: '/devicedata',
    method: 'get',
    params: {
      type: 1,
      device_id: id,
      start: date[0],
      end: date[1],
      last_id: lastId
    }
  })
}

export function getSurveyReport(poiId, type) {
  return request({
    url: '/findImage',
    method: 'get',
    params: {
      poi_id: poiId,
      type
    }
  })
}

export function pageDevice(pn, ps) {
  return request({
    url: '/listDevices3',
    method: 'get',
    params: {
      pn,
      ps
    }
  })
}
