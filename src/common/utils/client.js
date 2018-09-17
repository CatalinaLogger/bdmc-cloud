import {uint8ArrayToString} from 'common/utils'
let mqtt = require('mqtt')
let client = null

function createClient() {
  let username = 'browser'
  let password = 'u73igG84'
  let hostname = 'cloud.bdsmc.net:15675/ws'
  let url = `mqtt://${username}:${password}@${hostname}`
  return mqtt.connect(url)
}

export function initMqtt() {
  if (!client) {
    client = createClient()
  }
}

export function requestMqtt(topic, data) {
  initMqtt()
  let ts = new Date().getTime()
  topic = `${topic}/${ts}`
  // 发布消息
  client.publish(topic, data)
}

export function responseMqtt(topic, callBack) {
  let client = createClient()
  client.subscribe(topic)
  client.on('message', (topic, message) => {
    uint8ArrayToString(message, text => {
      callBack(JSON.parse(text))
    })
  })
}

export function sendVideoOrder(video) {
  let topic = `requestVideo/${new Date().getTime()}`
  let o = true
  if (video.online > 0) {
    o = false
  }
  let data = {
    phoneNumber: video.phone,
    order: o
  }
  requestMqtt(topic, JSON.stringify(data))
}

export function queryDeviceOrder(di2) {
  let topic = `requestDevice/${new Date().getTime()}`
  let data = {
    deviceId: di2,
    order: 0X00AA
  }
  requestMqtt(topic, JSON.stringify(data))
}
