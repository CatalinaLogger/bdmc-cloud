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

export function videoHistory(puid, begin, end) {
  return request({
    url: '/videoHistory',
    method: 'get',
    params: {
      puid,
      begin,
      end
    }
  })
}

export function getVideopic() {
  return request({
    url: '/getVideopic',
    method: 'get'
  })
}

export function getVideoPicByDate(id, date) {
  return request({
    url: '/getVideoPicByDate',
    method: 'get',
    params: {
      id,
      date
    }
  })
}
