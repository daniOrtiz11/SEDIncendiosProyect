#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

#define DHTPIN D2
#define DHTTYPE DHT22

#define LED D4

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "PRIMA'S WIFI";
const char* password = "Pr1m@s15072016";

const char* mqtt_server = "test.mosquitto.org";

const char* topic_subscribe = "bot_orders";
const char* topic_publish = "dht_values";

WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;
char msg[50];
int value = 0;

int hum_limit = 50;
int temp_limit = 30;


void setup() {
  pinMode(LED, OUTPUT); //inicializacion del led
  
  Serial.begin(115200); //baud rate
  digitalWrite(LED, HIGH); // se apaga el led
  
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
  char rcv[50];
  int len;
  for (int i = 0; i < length; i++) {
    char a = (char)payload[i];
    Serial.print(a);
    rcv[i] = a;
    len++; 
  }
  Serial.println();

  if (iguales(rcv, "led_on", length)) {
    digitalWrite(LED, LOW);  // se enciende con LOW
  }

  if (iguales(rcv, "led_off", length)){
    digitalWrite(LED, HIGH); // se apaga con high
  }

  if (iguales(rcv, "hum", 3)){
     int hum_limit = 0;
     for(int i = 5; i < length; i++){
      hum_limit = hum_limit*10 + entero(rcv[i]);
     }
     snprintf(msg, 75, "Limite de humedad configurado: %i", hum_limit);
     client.publish(topic_publish, msg);
  }
  if (iguales(rcv, "temp", 4)){
     int temp_limit = 0;
     for(int i = 6; i < length; i++){
      temp_limit = temp_limit*10 + entero(rcv[i]);
     }
     snprintf(msg, 75, "Limite de temperatura configurado: %i", temp_limit);
     client.publish(topic_publish, msg);
  }
}

bool iguales(char* str1, char* str2, int len){
  for (int i = 0; i < len; i++){
    if (str1[i] != str2[i])
      return false;
  }
  return true;
}

int entero(char a){
  switch(a){
  case '0': return 0;
  case '1': return 1;
  case '2': return 2;
  case '3': return 3;
  case '4': return 4;
  case '5': return 5;
  case '6': return 6;
  case '7': return 7;
  case '8': return 8;
  case '9': return 9;
  default: return 0;
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
  client.publish(topic_publish, msg);

  if(h > hum_limit || t > temp_limit){
    digitalWrite(LED, LOW);
  }
}
