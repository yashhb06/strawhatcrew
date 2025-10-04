#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

Servo myservo;
int pos = 0;
bool fireDetected = false;
bool pumpStatus = false;
bool manualControl = false;

// Sensors (use GPIO pins on ESP32)
#define Left_S    32
#define Right_S   33
#define Forward_S 25

// Motor driver pins
#define LM1 26
#define LM2 27
#define RM1 14
#define RM2 12

// Pump pin
#define pump 13  

// Servo pin
#define SERVO_PIN 15

// Wi-Fi credentials - CHANGE THESE!
const char* ssid = "FireBot";        // Your Wi-Fi SSID or create AP
const char* password = "12345678";   // Your Wi-Fi password

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Set to true for Access Point mode, false for Station mode
bool apMode = true;

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  pinMode(Left_S, INPUT);
  pinMode(Right_S, INPUT);
  pinMode(Forward_S, INPUT);

  // Initialize motor driver
  pinMode(LM1, OUTPUT);
  pinMode(LM2, OUTPUT);
  pinMode(RM1, OUTPUT);
  pinMode(RM2, OUTPUT);
  pinMode(pump, OUTPUT);

  digitalWrite(pump, HIGH); // Pump OFF at startup

  // ESP32 Servo setup
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  myservo.setPeriodHertz(50);
  myservo.attach(SERVO_PIN, 500, 2400);
  myservo.write(90);

  // Wi-Fi Setup
  if (apMode) {
    // Access Point Mode
    Serial.println("🔥 Starting FireBot Access Point...");
    WiFi.softAP(ssid, password);
    IPAddress IP = WiFi.softAPIP();
    Serial.print("📡 AP IP address: ");
    Serial.println(IP);
    Serial.println("Connect to Wi-Fi: FireBot");
    Serial.println("Password: 12345678");
  } else {
    // Station Mode - Connect to existing Wi-Fi
    Serial.println("🔥 Connecting to Wi-Fi...");
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    
    Serial.println("\n✅ Connected to Wi-Fi");
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
  }

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("🌐 WebSocket server started on port 81");
  Serial.println("🤖 FireBot Ready!");
}

void loop() {
  webSocket.loop();

  // Read sensors
  int left = digitalRead(Left_S);
  int right = digitalRead(Right_S);
  int front = digitalRead(Forward_S);

  // Update fire detection status
  fireDetected = (front == HIGH || left == HIGH || right == HIGH);

  // Send sensor data to all connected clients every 500ms
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 500) {
    sendSensorData();
    lastUpdate = millis();
  }

  // Autonomous mode (when not in manual control)
  if (!manualControl) {
    if (front == HIGH) {
      Serial.println("🔥 Fire detected in FRONT - extinguishing!");
      put_off_fire();
    }
    else if (left == HIGH) {
      Serial.println("🔥 Fire on LEFT - turning left");
      turnLeft();
      delay(400);
      stopMotors();
    }
    else if (right == HIGH) {
      Serial.println("🔥 Fire on RIGHT - turning right");
      turnRight();
      delay(400);
      stopMotors();
    }
    else if (left == LOW && right == LOW && front == LOW) {
      moveForward();
      delay(400);
      stopMotors();
    }
  }

  delay(100);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      manualControl = false;
      break;
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      manualControl = true;
      sendSensorData();
      break;
    }
    
    case WStype_TEXT: {
      String command = String((char*)payload);
      Serial.printf("[%u] Command received: %s\n", num, command.c_str());
      handleCommand(command);
      break;
    }
  }
}

void handleCommand(String cmd) {
  if (cmd == "F") {
    moveForward();
    Serial.println("⬆️ Moving Forward");
  }
  else if (cmd == "B") {
    moveBackward();
    Serial.println("⬇️ Moving Backward");
  }
  else if (cmd == "L") {
    turnLeft();
    Serial.println("⬅️ Turning Left");
  }
  else if (cmd == "R") {
    turnRight();
    Serial.println("➡️ Turning Right");
  }
  else if (cmd == "S") {
    stopMotors();
    Serial.println("⏹️ Stopped");
  }
  else if (cmd == "P1") {
    activatePump();
  }
  else if (cmd == "P0") {
    deactivatePump();
  }
}

void sendSensorData() {
  StaticJsonDocument<200> doc;
  doc["fire"] = fireDetected;
  doc["pump"] = pumpStatus;
  
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.broadcastTXT(jsonString);
}

void put_off_fire() {
  stopMotors();
  activatePump();

  for (pos = 60; pos <= 120; pos++) {
    myservo.write(pos);
    delay(10);
  }
  for (pos = 120; pos >= 60; pos--) {
    myservo.write(pos);
    delay(10);
  }
  myservo.write(90);
  delay(5000);

  deactivatePump();
  Serial.println("✅ Fire extinguished");
  delay(2000);
}

void activatePump() {
  digitalWrite(pump, LOW);  // Pump ON
  pumpStatus = true;
  Serial.println("💧 Pump ON");
  sendSensorData();
}

void deactivatePump() {
  digitalWrite(pump, HIGH);  // Pump OFF
  pumpStatus = false;
  Serial.println("💧 Pump OFF");
  sendSensorData();
}

void stopMotors() {
  digitalWrite(LM1, LOW);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, LOW);
  digitalWrite(RM2, LOW);
}

void moveForward() {
  digitalWrite(LM1, HIGH);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, HIGH);
  digitalWrite(RM2, LOW);
}

void moveBackward() {
  digitalWrite(LM1, LOW);
  digitalWrite(LM2, HIGH);
  digitalWrite(RM1, LOW);
  digitalWrite(RM2, HIGH);
}

void turnLeft() {
  digitalWrite(LM1, LOW);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, HIGH);
  digitalWrite(RM2, LOW);
}

void turnRight() {
  digitalWrite(LM1, HIGH);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, LOW);
  digitalWrite(RM2, LOW);
}
