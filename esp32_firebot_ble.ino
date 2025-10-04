#include <ESP32Servo.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

Servo myservo;
int pos = 0;
bool fireDetected = false;
bool pumpStatus = false;
bool manualControl = false;  // Toggle between manual and autonomous mode

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

// BLE UUIDs - IMPORTANT: Copy these to your React app's bluetooth.ts file!
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MOVEMENT_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define PUMP_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define SENSOR_CHAR_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26aa"

BLEServer* pServer = NULL;
BLECharacteristic* pMovementCharacteristic = NULL;
BLECharacteristic* pPumpCharacteristic = NULL;
BLECharacteristic* pSensorCharacteristic = NULL;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    manualControl = true;  // Switch to manual control when connected
    Serial.println("📱 Device Connected - Manual Control Enabled");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    manualControl = false;  // Switch back to autonomous when disconnected
    Serial.println("📱 Device Disconnected - Autonomous Mode Enabled");
    BLEDevice::startAdvertising();
  }
};

class MovementCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    if (value.length() > 0) {
      char command = value[0];
      Serial.print("Movement Command: ");
      Serial.println(command);
      
      switch(command) {
        case 'F':
          moveForward();
          Serial.println("⬆️ Moving Forward");
          break;
        case 'B':
          moveBackward();
          Serial.println("⬇️ Moving Backward");
          break;
        case 'L':
          turnLeft();
          Serial.println("⬅️ Turning Left");
          break;
        case 'R':
          turnRight();
          Serial.println("➡️ Turning Right");
          break;
        case 'S':
          stopMotors();
          Serial.println("⏹️ Stopped");
          break;
      }
    }
  }
};

class PumpCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    if (value.length() > 0) {
      String cmd = String(value.c_str());
      Serial.print("Pump Command: ");
      Serial.println(cmd);
      
      if (cmd == "P1") {
        activatePump();
      } else if (cmd == "P0") {
        deactivatePump();
      }
    }
  }
};

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

  // Initialize BLE
  BLEDevice::init("FireBot");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Movement Characteristic
  pMovementCharacteristic = pService->createCharacteristic(
    MOVEMENT_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pMovementCharacteristic->setCallbacks(new MovementCallbacks());

  // Pump Characteristic
  pPumpCharacteristic = pService->createCharacteristic(
    PUMP_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pPumpCharacteristic->setCallbacks(new PumpCallbacks());

  // Sensor Characteristic (for reading sensor data)
  pSensorCharacteristic = pService->createCharacteristic(
    SENSOR_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pSensorCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("🤖 FireBot Ready!");
  Serial.println("📡 BLE Advertising started - waiting for connection...");
  Serial.println("\n=== BLE UUIDs (Copy to React App) ===");
  Serial.println("SERVICE_UUID: " + String(SERVICE_UUID));
  Serial.println("MOVEMENT_CHAR_UUID: " + String(MOVEMENT_CHAR_UUID));
  Serial.println("PUMP_CHAR_UUID: " + String(PUMP_CHAR_UUID));
  Serial.println("SENSOR_CHAR_UUID: " + String(SENSOR_CHAR_UUID));
  Serial.println("=====================================\n");
}

void loop() {
  // Read sensors
  int left = digitalRead(Left_S);
  int right = digitalRead(Right_S);
  int front = digitalRead(Forward_S);

  // Update fire detection status
  fireDetected = (front == HIGH || left == HIGH || right == HIGH);

  // Send sensor data via BLE if connected
  if (deviceConnected) {
    String sensorData = "FIRE:" + String(fireDetected ? 1 : 0) + 
                       ",DIST:0" +  // No distance sensor in your setup
                       ",PUMP:" + String(pumpStatus ? 1 : 0);
    pSensorCharacteristic->setValue(sensorData.c_str());
    pSensorCharacteristic->notify();
  }

  // Autonomous mode (when not connected via BLE)
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
      Serial.println("No fire - moving forward");
      moveForward();
      delay(400);
      stopMotors();
    }
  }

  delay(100);
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
}

void deactivatePump() {
  digitalWrite(pump, HIGH);  // Pump OFF
  pumpStatus = false;
  Serial.println("💧 Pump OFF");
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
