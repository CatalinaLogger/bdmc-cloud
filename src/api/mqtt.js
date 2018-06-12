import {uint8ArrayToString} from 'common/utils'

export function handleMqttData(me, setMq) {
  let mqtt = require('mqtt')

  let username = 'browser'
  let password = 'u73igG84'
  let hostname = 'cloud.bdsmc.net:8083/ws'
  let topic = ''
  if (me.type === 1) {
    topic = 'a/#'
  } else {
    topic = `a/${me.id}`
  }

  var url = 'mqtt://' + username + ':' + password + '@' + hostname

  console.log(url)

  var client = mqtt.connect(url)
  // 订阅主题
  client.subscribe(topic)

  client.on('message', function(topic, message) {
    uint8ArrayToString(message, text => {
      var warn = JSON.parse(text)
      setMq(warn)
    })
  })
}
