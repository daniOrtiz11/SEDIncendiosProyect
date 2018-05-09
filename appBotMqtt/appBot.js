const TeleBot = require('telebot');
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org');
const bot = new TeleBot({
    token: '531123090:AAGM9crBR6MqgGcA0V4__VwTNjKdvckGzTs',
    usePlugins: ['askUser', 'commandButton','namedButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});
var id;
bot.on('text', (msg) => {
	client.on('message', function (topic, message) {
	  // message is Buffer
	  bot.sendMessage(msg.from.id, message.toString())
	  //client.end()
	})
});
 
client.on('connect', function () {
  client.subscribe('presence')
  //client.publish('presence', 'Hello mqtt')
})
 

bot.start();