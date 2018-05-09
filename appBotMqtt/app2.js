var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org')
 
client.on('connect', function () {
  client.subscribe('presence')
  client.publish('presence', 'hi')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  //client.end()
})