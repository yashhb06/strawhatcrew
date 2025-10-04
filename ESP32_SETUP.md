# 🔥 ESP32 FireBot Setup Guide

## 📋 Hardware Components

Based on your code, your FireBot uses:

- **ESP32 Development Board**
- **3 Flame Sensors** (Left, Right, Forward)
- **Motor Driver** (L298N or similar)
- **2 DC Motors** (Left and Right)
- **Water Pump**
- **Servo Motor** (for pump nozzle control)

## 🔌 Pin Configuration

### Sensors
- `Left Flame Sensor` → GPIO 32
- `Right Flame Sensor` → GPIO 33
- `Forward Flame Sensor` → GPIO 25

### Motor Driver
- `Left Motor 1 (LM1)` → GPIO 26
- `Left Motor 2 (LM2)` → GPIO 27
- `Right Motor 1 (RM1)` → GPIO 14
- `Right Motor 2 (RM2)` → GPIO 12

### Pump & Servo
- `Water Pump` → GPIO 13
- `Servo Motor` → GPIO 15

## 📚 Required Libraries

Install these libraries in Arduino IDE:

1. **ESP32Servo** - For servo control on ESP32
   - Go to: Sketch → Include Library → Manage Libraries
   - Search for "ESP32Servo" by Kevin Harrington
   - Click Install

2. **ESP32 BLE Arduino** - Already included with ESP32 board package

## 🛠️ Arduino IDE Setup

1. **Install ESP32 Board Support**
   - File → Preferences
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager
   - Search "ESP32" and install "esp32 by Espressif Systems"

2. **Select Your Board**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

3. **Configure Settings**
   - Upload Speed: 115200
   - Flash Frequency: 80MHz
   - Partition Scheme: Default

## 📡 BLE UUIDs

The ESP32 code uses these UUIDs (already configured in the React app):

```
SERVICE_UUID:        4fafc201-1fb5-459e-8fcc-c5c9c331914b
MOVEMENT_CHAR_UUID:  beb5483e-36e1-4688-b7f5-ea07361b26a8
PUMP_CHAR_UUID:      beb5483e-36e1-4688-b7f5-ea07361b26a9
SENSOR_CHAR_UUID:    beb5483e-36e1-4688-b7f5-ea07361b26aa
```

## 🚀 Upload Instructions

1. Open `esp32_firebot_ble.ino` in Arduino IDE
2. Connect your ESP32 via USB
3. Select the correct COM port: Tools → Port
4. Click Upload button
5. Wait for "Done uploading" message
6. Open Serial Monitor (115200 baud) to see status

## 🎮 Operating Modes

### 1. **Autonomous Mode** (Default when not connected)
- Robot automatically searches for fire
- Moves forward when no fire detected
- Turns toward fire when detected on left/right
- Extinguishes fire when detected in front

### 2. **Manual Control Mode** (When connected via BLE)
- Full manual control from web app
- Movement: Forward, Backward, Left, Right, Stop
- Pump control: ON/OFF
- Real-time sensor data sent to app

## 📊 Serial Monitor Output

When running, you'll see:
```
🤖 FireBot Ready!
📡 BLE Advertising started - waiting for connection...

=== BLE UUIDs (Copy to React App) ===
SERVICE_UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
...
=====================================

📱 Device Connected - Manual Control Enabled
Movement Command: F
⬆️ Moving Forward
💧 Pump ON
```

## 🔧 Troubleshooting

### BLE Connection Issues
- Make sure ESP32 is powered on
- Check Serial Monitor shows "BLE Advertising started"
- Ensure browser supports Web Bluetooth (Chrome/Edge)
- Try refreshing the web page

### Motor Not Moving
- Check motor driver connections
- Verify power supply to motors
- Test motor driver with simple code first

### Pump Not Working
- Check pump power supply (may need separate 12V)
- Verify GPIO 13 connection
- Test with digitalWrite(pump, LOW) directly

### Servo Not Moving
- Ensure servo has proper power (5V)
- Check GPIO 15 connection
- Verify ESP32Servo library is installed

## 🔥 Fire Detection Logic

The flame sensors output:
- `HIGH` = Fire detected
- `LOW` = No fire

The robot prioritizes:
1. **Front sensor** → Stop and extinguish
2. **Left sensor** → Turn left
3. **Right sensor** → Turn right
4. **No fire** → Move forward (autonomous mode only)

## 💧 Pump & Servo Sequence

When fire is detected in front:
1. Stop all motors
2. Turn pump ON
3. Sweep servo from 60° to 120° and back
4. Keep pump running for 5 seconds
5. Turn pump OFF
6. Resume operation

## 🔋 Power Requirements

- **ESP32**: 5V via USB or VIN
- **Motors**: 6-12V (via motor driver)
- **Pump**: 12V (check your pump specs)
- **Servo**: 5V
- **Flame Sensors**: 3.3V-5V

⚠️ **Important**: Use separate power supplies for motors/pump and ESP32 to avoid brownouts!

## 📱 Connecting to Web App

1. Upload code to ESP32
2. Power on the robot
3. Open the web app at http://localhost:5173
4. Click "Connect to Robot"
5. Select "FireBot" from the Bluetooth device list
6. Start controlling!

## 🎯 Next Steps

- Test each component individually first
- Calibrate flame sensor sensitivity
- Adjust servo sweep angles if needed
- Test pump water flow
- Fine-tune motor speeds in code
- Add battery level monitoring (optional)

---

**Need help?** Check the Serial Monitor for debug messages!
