/*
 * ========================================
 * ARDUINO UNO - FIRE EXTINGUISHING BOT
 * I²C Slave Controller
 * ========================================
 * 
 * This Arduino Uno acts as an I²C SLAVE device that receives commands
 * from ESP32 (I²C Master) and controls:
 * - DC Motors (via Motor Driver)
 * - Water Pump (via Relay)
 * - Servo Motor (for scanning)
 * - Fire Sensors (IR sensors)
 * 
 * I²C Communication:
 * - SDA: A4 (Arduino Uno)
 * - SCL: A5 (Arduino Uno)
 * - I²C Address: 0x08
 * 
 * Commands received from ESP32:
 * - 'F' = Move Forward
 * - 'B' = Move Backward
 * - 'L' = Turn Left
 * - 'R' = Turn Right
 * - 'S' = Stop
 * - 'P' = Pump ON
 * - 'p' = Pump OFF
 * - 'E' = EXTINGUISH (autonomous fire extinguishing)
 * 
 * Status sent back to ESP32:
 * - Byte format: [FIRE_STATUS][PUMP_STATUS]
 * - FIRE_STATUS: 0=no fire, 1=fire left, 2=fire right, 3=fire front
 * - PUMP_STATUS: 0=off, 1=on
 */

#include <Wire.h>
#include <Servo.h>

// ========================================
// I²C Configuration
// ========================================
#define I2C_SLAVE_ADDRESS 0x08  // Arduino Uno I²C address

// ========================================
// Pin Definitions
// ========================================
// Fire Sensors (IR sensors - LOW when fire detected)
#define SENSOR_LEFT    2
#define SENSOR_RIGHT   3
#define SENSOR_FORWARD 4

// Motor Driver Pins (L298N or similar)
#define MOTOR_LEFT_1   5   // Left motor direction 1
#define MOTOR_LEFT_2   6   // Left motor direction 2
#define MOTOR_RIGHT_1  7   // Right motor direction 1
#define MOTOR_RIGHT_2  8   // Right motor direction 2

// Pump Control (Relay)
#define PUMP_PIN       9   // Water pump relay

// Servo Motor
#define SERVO_PIN      10  // Servo for scanning

// ========================================
// Global Variables
// ========================================
Servo scanServo;
char receivedCommand = 'S';  // Default: Stop
bool pumpActive = false;
bool autonomousMode = false;

// Sensor status
byte fireStatus = 0;  // 0=no fire, 1=left, 2=right, 3=front

// ========================================
// SETUP
// ========================================
void setup() {
  // Initialize Serial for debugging
  Serial.begin(9600);
  Serial.println("========================================");
  Serial.println("Arduino Uno - FireBot I²C Slave");
  Serial.println("========================================");
  Serial.println("I²C Address: 0x08");
  Serial.println("Waiting for commands from ESP32...");
  Serial.println("========================================\n");

  // Initialize I²C as slave
  Wire.begin(I2C_SLAVE_ADDRESS);
  Wire.onReceive(receiveCommand);  // Register receive event
  Wire.onRequest(sendStatus);      // Register request event

  // Initialize Fire Sensors
  pinMode(SENSOR_LEFT, INPUT);
  pinMode(SENSOR_RIGHT, INPUT);
  pinMode(SENSOR_FORWARD, INPUT);

  // Initialize Motor Pins
  pinMode(MOTOR_LEFT_1, OUTPUT);
  pinMode(MOTOR_LEFT_2, OUTPUT);
  pinMode(MOTOR_RIGHT_1, OUTPUT);
  pinMode(MOTOR_RIGHT_2, OUTPUT);

  // Initialize Pump
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);  // Pump OFF at startup

  // Initialize Servo
  scanServo.attach(SERVO_PIN);
  scanServo.write(90);  // Center position

  // Stop all motors at startup
  stopMotors();
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  // Read fire sensors
  readFireSensors();

  // Execute received command
  executeCommand();

  // If in autonomous mode, handle fire detection
  if (autonomousMode) {
    handleAutonomousMode();
  }

  delay(50);  // Small delay for stability
}

// ========================================
// I²C RECEIVE EVENT
// Called when ESP32 sends data to Arduino
// ========================================
void receiveCommand(int numBytes) {
  if (Wire.available()) {
    receivedCommand = Wire.read();
    
    Serial.print("📨 Received: ");
    Serial.println(receivedCommand);

    // Clear any remaining bytes
    while (Wire.available()) {
      Wire.read();
    }
  }
}

// ========================================
// I²C REQUEST EVENT
// Called when ESP32 requests data from Arduino
// ========================================
void sendStatus() {
  // Send 2 bytes: [fireStatus][pumpStatus]
  byte statusData[2];
  statusData[0] = fireStatus;
  statusData[1] = pumpActive ? 1 : 0;
  
  Wire.write(statusData, 2);
  
  Serial.print("📤 Sent Status - Fire: ");
  Serial.print(fireStatus);
  Serial.print(", Pump: ");
  Serial.println(statusData[1]);
}

// ========================================
// READ FIRE SENSORS
// ========================================
void readFireSensors() {
  // IR sensors are typically LOW when fire detected
  bool leftFire = (digitalRead(SENSOR_LEFT) == LOW);
  bool rightFire = (digitalRead(SENSOR_RIGHT) == LOW);
  bool frontFire = (digitalRead(SENSOR_FORWARD) == LOW);

  // Determine fire status
  if (leftFire) {
    fireStatus = 1;  // Fire on left
  } else if (rightFire) {
    fireStatus = 2;  // Fire on right
  } else if (frontFire) {
    fireStatus = 3;  // Fire in front
  } else {
    fireStatus = 0;  // No fire
  }
}

// ========================================
// EXECUTE COMMAND
// ========================================
void executeCommand() {
  switch (receivedCommand) {
    case 'F':
      moveForward();
      autonomousMode = false;
      break;
      
    case 'B':
      moveBackward();
      autonomousMode = false;
      break;
      
    case 'L':
      turnLeft();
      autonomousMode = false;
      break;
      
    case 'R':
      turnRight();
      autonomousMode = false;
      break;
      
    case 'S':
      stopMotors();
      autonomousMode = false;
      break;
      
    case 'P':
      activatePump();
      break;
      
    case 'p':
      deactivatePump();
      break;
      
    case 'E':
      // EXTINGUISH command - enter autonomous mode
      autonomousMode = true;
      Serial.println("🔥 EXTINGUISH MODE ACTIVATED");
      break;
      
    default:
      // Unknown command - do nothing
      break;
  }
}

// ========================================
// AUTONOMOUS FIRE EXTINGUISHING MODE
// ========================================
void handleAutonomousMode() {
  if (fireStatus == 0) {
    // No fire detected - stop and scan
    stopMotors();
    scanForFire();
    deactivatePump();
  } else if (fireStatus == 1) {
    // Fire on left - turn left
    turnLeft();
    delay(100);
  } else if (fireStatus == 2) {
    // Fire on right - turn right
    turnRight();
    delay(100);
  } else if (fireStatus == 3) {
    // Fire in front - move forward and activate pump
    moveForward();
    activatePump();
    delay(100);
  }
}

// ========================================
// SCAN FOR FIRE (Servo sweep)
// ========================================
void scanForFire() {
  static unsigned long lastScanTime = 0;
  static int scanPosition = 90;
  static int scanDirection = 1;
  
  if (millis() - lastScanTime > 50) {
    scanPosition += (scanDirection * 10);
    
    if (scanPosition >= 180) {
      scanPosition = 180;
      scanDirection = -1;
    } else if (scanPosition <= 0) {
      scanPosition = 0;
      scanDirection = 1;
    }
    
    scanServo.write(scanPosition);
    lastScanTime = millis();
  }
}

// ========================================
// MOTOR CONTROL FUNCTIONS
// ========================================

void moveForward() {
  digitalWrite(MOTOR_LEFT_1, HIGH);
  digitalWrite(MOTOR_LEFT_2, LOW);
  digitalWrite(MOTOR_RIGHT_1, HIGH);
  digitalWrite(MOTOR_RIGHT_2, LOW);
  Serial.println("⬆️  Moving Forward");
}

void moveBackward() {
  digitalWrite(MOTOR_LEFT_1, LOW);
  digitalWrite(MOTOR_LEFT_2, HIGH);
  digitalWrite(MOTOR_RIGHT_1, LOW);
  digitalWrite(MOTOR_RIGHT_2, HIGH);
  Serial.println("⬇️  Moving Backward");
}

void turnLeft() {
  digitalWrite(MOTOR_LEFT_1, LOW);
  digitalWrite(MOTOR_LEFT_2, HIGH);
  digitalWrite(MOTOR_RIGHT_1, HIGH);
  digitalWrite(MOTOR_RIGHT_2, LOW);
  Serial.println("⬅️  Turning Left");
}

void turnRight() {
  digitalWrite(MOTOR_LEFT_1, HIGH);
  digitalWrite(MOTOR_LEFT_2, LOW);
  digitalWrite(MOTOR_RIGHT_1, LOW);
  digitalWrite(MOTOR_RIGHT_2, HIGH);
  Serial.println("➡️  Turning Right");
}

void stopMotors() {
  digitalWrite(MOTOR_LEFT_1, LOW);
  digitalWrite(MOTOR_LEFT_2, LOW);
  digitalWrite(MOTOR_RIGHT_1, LOW);
  digitalWrite(MOTOR_RIGHT_2, LOW);
  Serial.println("⏹️  Motors Stopped");
}

// ========================================
// PUMP CONTROL FUNCTIONS
// ========================================

void activatePump() {
  digitalWrite(PUMP_PIN, HIGH);
  pumpActive = true;
  Serial.println("💧 Pump ACTIVATED");
}

void deactivatePump() {
  digitalWrite(PUMP_PIN, LOW);
  pumpActive = false;
  Serial.println("💧 Pump DEACTIVATED");
}
