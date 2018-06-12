import request from 'common/utils/request'

export function videoPage(page, size) {
  return request({
    url: '/videoList',
    method: 'get',
    params: {
      page: page,
      rows: size
    }
  })
}

export function videoPath(puid) {
  return request({
    url: '/videosource',
    method: 'get',
    params: {
      puid
    }
  })
}
