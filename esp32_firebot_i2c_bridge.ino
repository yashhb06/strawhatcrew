/*
 * ========================================
 * ESP32 - FIRE EXTINGUISHING BOT
 * BLE to I²C Bridge Controller
 * ========================================
 * 
 * This ESP32 acts as a communication bridge between:
 * 1. React Web App (via Bluetooth Low Energy)
 * 2. Arduino Uno (via I²C)
 * 
 * Communication Flow:
 * React App → [BLE] → ESP32 → [I²C] → Arduino Uno
 * Arduino Uno → [I²C] → ESP32 → [BLE] → React App
 * 
 * I²C Configuration:
 * - ESP32 is I²C MASTER
 * - Arduino Uno is I²C SLAVE (Address: 0x08)
 * - SDA: GPIO 21 (ESP32) → A4 (Arduino)
 * - SCL: GPIO 22 (ESP32) → A5 (Arduino)
 * - Common Ground required
 * 
 * BLE UUIDs:
 * - Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * - Movement Characteristic: beb5483e-36e1-4688-b7f5-ea07361b26a8
 * - Pump Characteristic: beb5483e-36e1-4688-b7f5-ea07361b26a9
 * - Sensor Characteristic: beb5483e-36e1-4688-b7f5-ea07361b26aa
 * 
 * Commands from React App:
 * - 'F' = Forward
 * - 'B' = Backward
 * - 'L' = Left
 * - 'R' = Right
 * - 'S' = Stop
 * - 'P1' = Pump ON
 * - 'P0' = Pump OFF
 * - 'EXTINGUISH' = Autonomous fire extinguishing mode
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ========================================
// I²C Configuration
// ========================================
#define I2C_SDA 21              // ESP32 SDA pin
#define I2C_SCL 22              // ESP32 SCL pin
#define ARDUINO_I2C_ADDRESS 0x08 // Arduino Uno I²C address
#define I2C_FREQUENCY 100000     // 100kHz

// ========================================
// BLE UUIDs - Copy these to React app!
// ========================================
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MOVEMENT_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define PUMP_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define SENSOR_CHAR_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26aa"

// ========================================
// BLE Objects
// ========================================
BLEServer* pServer = NULL;
BLECharacteristic* pMovementCharacteristic = NULL;
BLECharacteristic* pPumpCharacteristic = NULL;
BLECharacteristic* pSensorCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// ========================================
// Status Variables
// ========================================
byte fireStatus = 0;      // 0=no fire, 1=left, 2=right, 3=front
bool pumpStatus = false;
unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 500; // Update every 500ms

// ========================================
// BLE Server Callbacks
// ========================================
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("\n========================================");
    Serial.println("📱 BLE Device Connected!");
    Serial.println("========================================");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("\n========================================");
    Serial.println("📱 BLE Device Disconnected");
    Serial.println("========================================");
  }
};

// ========================================
// Movement Command Callbacks
// ========================================
class MovementCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    
    if (value.length() > 0) {
      char command = value[0];
      
      Serial.print("📨 BLE Command Received: ");
      Serial.println(command);
      
      // Send command to Arduino via I²C
      bool success = sendCommandToArduino(command);
      
      if (success) {
        Serial.print("✅ Command '");
        Serial.print(command);
        Serial.println("' sent to Arduino via I²C");
        
        // Print human-readable action
        switch(command) {
          case 'F': Serial.println("   → Moving Forward"); break;
          case 'B': Serial.println("   → Moving Backward"); break;
          case 'L': Serial.println("   → Turning Left"); break;
          case 'R': Serial.println("   → Turning Right"); break;
          case 'S': Serial.println("   → Stopping"); break;
        }
      } else {
        Serial.println("❌ Failed to send command to Arduino");
      }
    }
  }
};

// ========================================
// Pump Command Callbacks
// ========================================
class PumpCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    
    if (value.length() > 0) {
      String cmd = String(value.c_str());
      
      Serial.print("📨 Pump Command Received: ");
      Serial.println(cmd);
      
      char pumpCommand;
      if (cmd == "P1") {
        pumpCommand = 'P';  // Pump ON
        pumpStatus = true;
      } else if (cmd == "P0") {
        pumpCommand = 'p';  // Pump OFF (lowercase)
        pumpStatus = false;
      } else if (cmd == "EXTINGUISH") {
        pumpCommand = 'E';  // Autonomous extinguish mode
        Serial.println("🔥 EXTINGUISH MODE ACTIVATED");
      } else {
        return;
      }
      
      // Send pump command to Arduino via I²C
      bool success = sendCommandToArduino(pumpCommand);
      
      if (success) {
        Serial.print("✅ Pump command sent to Arduino: ");
        Serial.println(pumpStatus ? "ON" : "OFF");
      } else {
        Serial.println("❌ Failed to send pump command to Arduino");
      }
    }
  }
};

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n========================================");
  Serial.println("ESP32 FireBot - BLE to I²C Bridge");
  Serial.println("========================================");
  
  // Initialize I²C as Master
  Wire.begin(I2C_SDA, I2C_SCL, I2C_FREQUENCY);
  Serial.println("✅ I²C Master initialized");
  Serial.print("   SDA: GPIO ");
  Serial.println(I2C_SDA);
  Serial.print("   SCL: GPIO ");
  Serial.println(I2C_SCL);
  Serial.print("   Arduino Address: 0x");
  Serial.println(ARDUINO_I2C_ADDRESS, HEX);
  
  // Test I²C connection to Arduino
  delay(1000);
  testI2CConnection();
  
  // Initialize BLE
  Serial.println("\n📡 Initializing BLE...");
  BLEDevice::init("FireBot");
  
  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // Create Movement Characteristic
  pMovementCharacteristic = pService->createCharacteristic(
    MOVEMENT_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pMovementCharacteristic->setCallbacks(new MovementCallbacks());
  
  // Create Pump Characteristic
  pPumpCharacteristic = pService->createCharacteristic(
    PUMP_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pPumpCharacteristic->setCallbacks(new PumpCallbacks());
  
  // Create Sensor Characteristic (for notifications)
  pSensorCharacteristic = pService->createCharacteristic(
    SENSOR_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | 
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pSensorCharacteristic->addDescriptor(new BLE2902());
  
  // Start the service
  pService->start();
  
  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("✅ BLE Service started");
  Serial.println("\n========================================");
  Serial.println("🤖 FireBot Ready!");
  Serial.println("========================================");
  Serial.println("Waiting for BLE connection...");
  Serial.println("\n📋 BLE UUIDs (Copy to React App):");
  Serial.println("SERVICE_UUID: " + String(SERVICE_UUID));
  Serial.println("MOVEMENT_CHAR_UUID: " + String(MOVEMENT_CHAR_UUID));
  Serial.println("PUMP_CHAR_UUID: " + String(PUMP_CHAR_UUID));
  Serial.println("SENSOR_CHAR_UUID: " + String(SENSOR_CHAR_UUID));
  Serial.println("========================================\n");
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  // Handle BLE connection state changes
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("📡 Started advertising again");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  // Periodically read sensor data from Arduino and send to React app
  if (deviceConnected && (millis() - lastSensorUpdate > SENSOR_UPDATE_INTERVAL)) {
    readSensorDataFromArduino();
    sendSensorDataToBLE();
    lastSensorUpdate = millis();
  }
  
  delay(10);
}

// ========================================
// SEND COMMAND TO ARDUINO VIA I²C
// ========================================
bool sendCommandToArduino(char command) {
  Wire.beginTransmission(ARDUINO_I2C_ADDRESS);
  Wire.write(command);
  byte error = Wire.endTransmission();
  
  if (error == 0) {
    return true;  // Success
  } else {
    Serial.print("❌ I²C Error: ");
    Serial.println(error);
    return false;
  }
}

// ========================================
// READ SENSOR DATA FROM ARDUINO VIA I²C
// ========================================
void readSensorDataFromArduino() {
  // Request 2 bytes from Arduino: [fireStatus][pumpStatus]
  Wire.requestFrom(ARDUINO_I2C_ADDRESS, 2);
  
  if (Wire.available() >= 2) {
    fireStatus = Wire.read();
    byte pumpByte = Wire.read();
    pumpStatus = (pumpByte == 1);
    
    // Debug output (only print when values change)
    static byte lastFireStatus = 255;
    static bool lastPumpStatus = false;
    
    if (fireStatus != lastFireStatus || pumpStatus != lastPumpStatus) {
      Serial.print("📊 Sensor Update - Fire: ");
      
      switch(fireStatus) {
        case 0: Serial.print("None"); break;
        case 1: Serial.print("Left"); break;
        case 2: Serial.print("Right"); break;
        case 3: Serial.print("Front"); break;
        default: Serial.print("Unknown"); break;
      }
      
      Serial.print(", Pump: ");
      Serial.println(pumpStatus ? "ON" : "OFF");
      
      lastFireStatus = fireStatus;
      lastPumpStatus = pumpStatus;
    }
  }
}

// ========================================
// SEND SENSOR DATA TO REACT APP VIA BLE
// ========================================
void sendSensorDataToBLE() {
  // Format: "FIRE:X,DIST:0,PUMP:Y"
  // FIRE: 0=none, 1=detected
  // DIST: 0 (not used, for compatibility)
  // PUMP: 0=off, 1=on
  
  String sensorData = "FIRE:" + String(fireStatus > 0 ? 1 : 0) + 
                     ",DIST:0" +
                     ",PUMP:" + String(pumpStatus ? 1 : 0);
  
  pSensorCharacteristic->setValue(sensorData.c_str());
  pSensorCharacteristic->notify();
}

// ========================================
// TEST I²C CONNECTION TO ARDUINO
// ========================================
void testI2CConnection() {
  Serial.println("\n🔍 Testing I²C connection to Arduino...");
  
  Wire.beginTransmission(ARDUINO_I2C_ADDRESS);
  byte error = Wire.endTransmission();
  
  if (error == 0) {
    Serial.println("✅ Arduino Uno detected on I²C bus!");
  } else {
    Serial.println("❌ Arduino Uno NOT detected!");
    Serial.println("⚠️  Check I²C connections:");
    Serial.println("   - SDA: ESP32 GPIO21 → Arduino A4");
    Serial.println("   - SCL: ESP32 GPIO22 → Arduino A5");
    Serial.println("   - Common Ground connected");
    Serial.println("   - Arduino powered and running I²C slave code");
  }
}
