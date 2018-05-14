const TeleBot = require('telebot');
var mqtt = require('mqtt');
const bd = require('./ourbd');
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
var isRunning = false;

// Al enviar el mensaje desde Arduino, se indicará un ID de dispositivo, tanto en la Temperatura como en la Humedad.
client.on('message', function (topic, message) {
	  // message is Buffer
	  // Cada vez que llega la temperatura y la humedad.
	  var mensaje = message.toString();
	  var idDisp;
	  if(!mensaje.indexOf('1d')) idDisp = 1;
	  else if(!mensaje.indexOf('2d')) idDisp = 2;
	  
	  bd.getIdTelegram(idDisp,function(err, result){
		  if(err){
			console.log(err);
		  } else {
			  console.log(mensaje);
			  if(mensaje.indexOf('Temperatura')){
				var temperatura = mensaje.split(':')[1];
				if(temperatura > 35.0){
					bot.sendMessage('140760980', "Tiene un INCENDIO en su casa! Su temperatura es de: " + temperatura + "ºC");
				}
			  } else { //Humedad
				var humedad = mensaje.split(':')[1];
				if(humedad > 90.0){
					bot.sendMessage('140760980', "Tiene una INUNDACIÓN en su casa! Su humedad es de: " + humedad);	
				}
			  }
		  }
	  });
	  //idTel = idTel.idTelegram;
	  //bot.sendMessage(id, message.toString())
	  //client.end()
})
 
client.on('connect', function () {
  client.subscribe('presence')
  //client.publish('presence', 'Hello mqtt')
})

bot.on('/help', (data) => {
	
	if(isRunning == true){
		bot.sendMessage(id, "Si su casa está en peligro de incendio o inundación se lo notificaremos automáticamente. \n\n" +
							"Lista de comandos: \n" +
							"/temp -> Temperatura actual de su casa \n" +
							"/hum -> Humedad actual de su casa.");
	}
});

bot.on('/temp', (data) => {
	if(isRunning == true){
		client.on('message', function (topic, message) {
			 var mensaje = message.toString();
			  var idDisp;
			  if(mensaje.indexOf('1')) idDisp = 1;
			  else idDisp = 2;
			  bd.getIdTelegram(idDisp,function(err, result){
				  if(err){
					console.log(err);
				  } else {
					if(mensaje.indexOf('Temperatura')){
						var temperatura = mensaje.split(':')[1];
						bot.sendMessage(result, "La temperatura actual en su casa es de: " + temperatura + "ºC");  
					}
				  }
			  });
		});
	}
});

bot.on('/hum', (data) => {
	if(isRunning == true){
		client.on('message', function (topic, message) {
			 var mensaje = message.toString();
			  var idDisp;
			  if(mensaje.indexOf('1')) idDisp = 1;
			  else idDisp = 2;
			  bd.getIdTelegram(idDisp,function(err, result){
				  if(err){
					console.log(err);
				  } else {
					if(mensaje.indexOf('Humedad')){
						var humedad = mensaje.split(':')[1];
						bot.sendMessage(result, "La humedad actual en su casa es de: " + humedad);  
					}
				  }
			  });		
		});
	}
});

function setID(){
	bot.on('text', (data) => {
		var texto = data.text;
		id = data.from.id;
		if(texto != "" && texto != null && texto != undefined){
			if(texto == "/start" || texto == "/hi" || texto == "/hello"){
				isRunning = true;
				bd.userOn(id,function(err,result){
					if(err){
						console.log(err);
					} else {
						if(result[0].usersCount < 1){
							bd.insertarUsuarioBD(id,function(err, result){
								if(err){
								  console.log(err);
							   }else{
									bot.sendMessage(id,"Bienvenido a Fires&Floods Bot. Desde ahora le avisaremos cuando su casa esté en peligro de incendio o inundación. \n" +
																  "Para conseguir ayuda del sistema, utilice el comando /help.");
							   }
							});
						} else {
							bot.sendMessage(id, "Su bot ya está iniciado, no hace falta que ponga más el comando de inicio");
						}
					}

				});
			}
		}
	});
}

function init(){
	bd.startConnection();
	setID();
    bot.start();
}
 

init();