#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

#define DHTPIN D2
#define DHTTYPE DHT22
#define BUILTIN_LED D4

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "";
const char* password = "";

const char* mqtt_server = "test.mosquitto.org";

const char* topic_subscribe = "bot_orders"
const char* topic_publish = "dht_values"

WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;
char msg[50];
int value = 0;

int highTemp = 70;
int medTemp = 50;
int lowTemp = 30;

int highHum = 70;
int medHum = 50;
int lowHum = 30;


void setup() {
  pinMode(BUILTIN_LED, OUTPUT); //inicializacion del primer led
  pinMode(2, OUTPUT); // inicializacion del segundo led
  
  Serial.begin(115200); //baud rate
  digitalWrite(BUILTIN_LED, LOW); // se apaga el led
  digitalWrite(2, LOW); //se apaga el led
  
  setup_wifi(); //conexion del wifi
  client.setServer(mqtt_server, 1883); //servidor mqtt y puerto
  client.setCallback(callback); //funcion de callback para cuando se reciba un mensaje
  
  dht.begin(); //se inician los sensores
}

void setup_wifi() {

  delay(10);
  
  Serial.println(ssid); //muestra la red a la que se quiere conectar

  WiFi.begin(ssid, password); //red y password

  while (WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
  }

  Serial.println(""); 
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // Switch on the LED if an 1 was received as first character
  if ((String)payload[0] == 'led1on') {
    digitalWrite(2, LOW);  // se enciende con LOW
  }
  if ((String)payload[0] == 'led2on') {
    digitalWrite(BUILTIN_LED, LOW);  // se enciende con LOW
  }

  if ((String)payload[0]=='led1off'){
    digitalWrite(2, HIGH); // se apaga con high
  }

  if ((String)payload[0]=='led2off'){
    digitalWrite(BUILTINLED, HIGH); // se apaga con high
  }

}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Intento de conexión MQTT");
    if (client.connect("ESP8266Client")) { //si se ha conseguido conectar a MQTT
      Serial.println("conectado"); //informa de que se ha podido conectar
      client.publish(topic_publish, "conectado"); // publica en 'topic_publish' (definido arriba) que se ha conectado
      client.subscribe(topic_subscribe); // se suscribe 'topic_subscribe' (definido arriba)
    } else { // no ha coneguido conectarse a MQTT, informa del fallo
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}
void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  delay(2000);

  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, h, false);

  snprintf(msg, 75, "Humedad: %f", h);
  client.publish(topic_publish, msg);
  snprintf(msg, 75, "Temperatura ºC: %f", t);
  client.publish(topic_publish, msg);
  snprintf(msg, 75, "Heat index ºC: %f", hic);

  if(h>80){
    digitalWrite(BUILTIN_LED, LOW);
  }
}
