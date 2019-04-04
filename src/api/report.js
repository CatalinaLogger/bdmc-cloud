import request from 'common/utils/request'

export function getProjectList() {
  return request({
    url: '/listProjects',
    method: 'get'
  })
}

export function getReportData(projectId, online, recentUpdate) {
  return request({
    url: '/getSomeThingByProjectId',
    method: 'get',
    params: {
      projectId,
      online,
      recentUpdate
    }
  })
}

export function getReportDataType(projectId) {
  return request({
    url: '/getOtherThingsByProjectId',
    method: 'get',
    params: {
      projectId
    }
  })
}

export function getDeviceInfo(deviceId) {
  return request({
    url: '/getSomeThingByDeviceId',
    method: 'get',
    params: {
      deviceId
    }
  })
}

export function getDeviceData(deviceId, pageNumber, pageSize) {
  return request({
    url: '/getSensorInfoByDeviceId',
    method: 'get',
    params: {
      deviceId,
      pageNumber,
      pageSize
    }
  })
}
