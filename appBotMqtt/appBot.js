const TeleBot = require('telebot');
var mqtt = require('mqtt');
const bd = require('./ourbd');
var client  = mqtt.connect('mqtt://192.168.1.11:1883');
//Temperatura en incendio: 37º a ras de suelo - 130º media altura
var LimiteTemperatura = 40;
//Normal entre 30 y 60;
var LimiteHumedad = 70;
var getTemperatura = false;
var getHumedad = false;
const bot = new TeleBot({
    token: '531123090:AAGM9crBR6MqgGcA0V4__VwTNjKdvckGzTs',
    usePlugins: ['askUser', 'commandButton','namedButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});

/* Comandos que reconoce mqtt como strings:
- led_on - enciende el led del arduino
- led_off - apaga el led del arduino
- hum: 30 - configura el limite de la humedad para que se encienda el led a 30, se puede poner el numero entero que se quiera (esta hecho para ponerlo asi, 
  con un espacio detras de los dos puntos y ningun espacio antes de hum ni despues del valor)
- temp: 50 - configura el limite de la temperatura a 50 de forma similar a la humedad
- 2d humedad - comando para pedir la humedad por el canal del segundo bot
- 2d temperatura - comando para pedir la temperatura por el canal del segundo bot
*/
var ids = {};
var isRunning = false;

// Al enviar el mensaje desde Arduino, se indicará un ID de dispositivo, tanto en la Temperatura como en la Humedad.
client.on('message', function (topic, message) {
	  // message is Buffer
	  // Cada vez que llega la temperatura y la humedad.
	  var mensaje = message.toString();
        console.log(mensaje);
	  var idDisp;
	  if(!mensaje.indexOf('1d')){
         idDisp = ids[0].idTelegram; 
          if(mensaje.indexOf("Temperatura pedida") != -1 && getTemperatura == true){
              var temperatura = mensaje.split(':')[1];
              getTemperatura = false;
              bot.sendMessage(idDisp, "Su temperatura es de: " + temperatura + "ºC");
          }
          if(mensaje.indexOf("Humedad pedida") != -1 && getHumedad == true){
              var humedad = mensaje.split(':')[1];
              getHumedad = false;
              bot.sendMessage(idDisp, "Su humedad es de: " + humedad + " %");
          }
          if(mensaje.indexOf('Temperatura') != -1 && getTemperatura == false){
            var temperatura = mensaje.split(':')[1];
            if(temperatura > LimiteTemperatura){
                bot.sendMessage(idDisp, "Tiene un INCENDIO en su casa! Su temperatura es de: " + temperatura + "ºC");
            }

          } else if(mensaje.indexOf('Humedad') != -1 && getHumedad == false){ //Humedad
            var humedad = mensaje.split(':')[1];
            if(humedad > LimiteHumedad){
                bot.sendMessage(idDisp, "Tiene una INUNDACIÓN en su casa! Su humedad es de: " + humedad + " %");	
            }
          }
      } 
	  else if(!mensaje.indexOf('2d')) {
         idDisp = ids[1].idTelegram; 
          if(mensaje.indexOf("Temperatura pedida") != -1 && getTemperatura == true){
              var temperatura = mensaje.split(':')[1];
              getTemperatura = false;
              bot.sendMessage(idDisp, "Su temperatura es de: " + temperatura + "ºC");
          }
          if(mensaje.indexOf("Humedad pedida") != -1 && getHumedad == true){
              var humedad = mensaje.split(':')[1];
              getHumedad = false;
              bot.sendMessage(idDisp, "Su humedad es de: " + humedad + " %");
          }
          if(mensaje.indexOf('Temperatura') != -1 && getTemperatura == false){
            var temperatura = mensaje.split(':')[1];
            if(temperatura > LimiteTemperatura){
                bot.sendMessage(idDisp, "Tiene un INCENDIO en su casa! Su temperatura es de: " + temperatura + "ºC");
            }

          } else if(mensaje.indexOf('Humedad') != -1 && getHumedad == false){ //Humedad
            var humedad = mensaje.split(':')[1];
            if(humedad > LimiteHumedad){
                bot.sendMessage(idDisp, "Tiene una INUNDACIÓN en su casa! Su humedad es de: " + humedad + " %");	
            }
          }
      }
})
 
client.on('connect', function () {
  client.subscribe('bot_orders');
  client.subscribe('dht_values');
client.subscribe('dht_values1');
    client.subscribe('dht_values2');
})

bot.on('/help', (data) => {
	var id = data.from.id;
	if(isRunning == true){
		bot.sendMessage(id, "Si su casa está en peligro de incendio o inundación se lo notificaremos automáticamente. \n\n" +
							"Lista de comandos: \n" +
							"/temp -> Temperatura actual de su casa \n" +
							"/hum -> Humedad actual de su casa \n" +
                            "/ok -> Entendida la alerta");
	}
});

bot.on('text', (data) => {
     var texto = data.text;
    var id = data.from.id;
    if(texto != "/temp" && texto != "/help" && texto !="/hum" && texto != "/ok"){
        bot.sendMessage(id, "Por favor, introduzca uno de los comandos válidos. \n\n" +
                        "Si su casa está en peligro de incendio o inundación se lo notificaremos automáticamente. \n\n" +
							"Lista de comandos: \n" +
							"/temp -> Temperatura actual de su casa \n" +
							"/hum -> Humedad actual de su casa  \n" +
                            "/ok -> Entendida la alerta"
                            );
    }
});

bot.on('/ok', (data) => {
     var texto = data.text;
    var id = data.from.id;
        bot.sendMessage(id, "Apagando la alerta \n");
        client.publish('bot_orders', 'led_off');
});


bot.on('/temp', (data) => {
	if(isRunning == true){
        getTemperatura = true;
        console.log("pidiendo temperatura");
        client.publish('bot_orders', '2d temperatura');
        client.publish('bot_orders', '1d temperatura');
        
        
		/*client.on('message', function (topic, message) {
			 var mensaje = message.toString();
			  var idDisp;
			  if(mensaje.indexOf('1d')) idDisp = 1;
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
		});*/
	}
});

bot.on('/hum', (data) => {
	if(isRunning == true){
        client.publish('bot_orders', '2d humedad');
        client.publish('bot_orders', '1d humedad');
        getHumedad = true;
        
		/*client.on('message', function (topic, message) {
			 var mensaje = message.toString();
			  var idDisp;
			  if(mensaje.indexOf('1d')) idDisp = 1;
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
		});*/
	}
});

function setID(){
	bot.on('text', (data) => {
		var texto = data.text;
		var id = data.from.id;
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
                            bot.sendMessage(id,"Bienvenido a Fires&Floods Bot. Desde ahora le avisaremos cuando su casa esté en peligro de incendio o inundación. \n" +
																  "Para conseguir ayuda del sistema, utilice el comando /help.");
						}
					}

				});
			}
		}
	});
}

function init(){
	bd.startConnection();
	bd.getIdsBD(function(err, result){
		if(err){
			console.log(err);
		} else {
		ids = result;
		}
	});
	setID();
    bot.start();
}
 

init();