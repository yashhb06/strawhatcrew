# 🔥 FireBot I²C Integration Guide

Complete setup guide for React + ESP32 + Arduino Uno Fire Extinguishing Bot with I²C communication.

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Hardware Requirements](#hardware-requirements)
- [Wiring Diagram](#wiring-diagram)
- [Software Setup](#software-setup)
- [Communication Protocol](#communication-protocol)
- [Testing & Troubleshooting](#testing--troubleshooting)

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   React Web App │  (User Interface)
│   (Browser)     │
└────────┬────────┘
         │ Bluetooth Low Energy (BLE)
         │ Web Bluetooth API
         ▼
┌─────────────────┐
│     ESP32       │  (Communication Bridge)
│   I²C Master    │
└────────┬────────┘
         │ I²C (SDA/SCL)
         │ Wire Protocol
         ▼
┌─────────────────┐
│  Arduino Uno    │  (Motor Controller)
│   I²C Slave     │
│   Address: 0x08 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Motors, Pump,  │
│  Sensors, Servo │
└─────────────────┘
```

### Communication Flow

**Command Flow (User → Robot):**
1. User clicks button in React app
2. React sends BLE command to ESP32
3. ESP32 receives BLE command
4. ESP32 forwards command to Arduino via I²C
5. Arduino executes motor/pump control

**Status Flow (Robot → User):**
1. Arduino reads sensors (fire detection)
2. ESP32 requests status from Arduino via I²C
3. Arduino sends sensor data to ESP32
4. ESP32 sends data to React app via BLE notifications
5. React app displays real-time status

---

## 🔧 Hardware Requirements

### Components
- **ESP32 Development Board** (with BLE support)
- **Arduino Uno** (or compatible)
- **L298N Motor Driver** (or similar dual H-bridge)
- **DC Motors** (2x for left/right wheels)
- **Water Pump** with relay module
- **Servo Motor** (for scanning)
- **IR Flame Sensors** (3x: left, right, forward)
- **Jumper Wires**
- **Power Supply** (appropriate for motors and pump)

### Pin Requirements

#### ESP32 Pins
- **GPIO 21**: I²C SDA (to Arduino A4)
- **GPIO 22**: I²C SCL (to Arduino A5)
- **GND**: Common ground with Arduino

#### Arduino Uno Pins
- **A4 (SDA)**: I²C Data (to ESP32 GPIO 21)
- **A5 (SCL)**: I²C Clock (to ESP32 GPIO 22)
- **D2**: Left Fire Sensor
- **D3**: Right Fire Sensor
- **D4**: Forward Fire Sensor
- **D5**: Motor Left 1
- **D6**: Motor Left 2
- **D7**: Motor Right 1
- **D8**: Motor Right 2
- **D9**: Pump Relay
- **D10**: Servo Motor
- **GND**: Common ground with ESP32

---

## 🔌 Wiring Diagram

### I²C Connection (ESP32 ↔ Arduino)
```
ESP32          Arduino Uno
─────          ───────────
GPIO 21 ────── A4 (SDA)
GPIO 22 ────── A5 (SCL)
GND     ────── GND
```

**⚠️ CRITICAL:** Both devices MUST share a common ground!

### Arduino to Motor Driver (L298N)
```
Arduino    L298N
───────    ─────
D5      →  IN1 (Left Motor)
D6      →  IN2 (Left Motor)
D7      →  IN3 (Right Motor)
D8      →  IN4 (Right Motor)
```

### Arduino to Sensors
```
Arduino    Sensor
───────    ──────
D2      ←  Left Fire Sensor (OUT)
D3      ←  Right Fire Sensor (OUT)
D4      ←  Forward Fire Sensor (OUT)
5V      →  Sensor VCC
GND     →  Sensor GND
```

### Arduino to Pump & Servo
```
Arduino    Component
───────    ─────────
D9      →  Relay Module (IN)
D10     →  Servo Signal
5V      →  Servo VCC
GND     →  Servo GND
```

---

## 💻 Software Setup

### Step 1: Upload Arduino Code

1. Open Arduino IDE
2. Open `arduino_uno_firebot_slave.ino`
3. Select **Board**: Arduino Uno
4. Select **Port**: Your Arduino's COM port
5. Click **Upload**
6. Open **Serial Monitor** (9600 baud) to verify it's running

**Expected Serial Output:**
```
========================================
Arduino Uno - FireBot I²C Slave
========================================
I²C Address: 0x08
Waiting for commands from ESP32...
========================================
```

### Step 2: Upload ESP32 Code

1. Open Arduino IDE
2. Install ESP32 board support if not already installed
3. Open `esp32_firebot_i2c_bridge.ino`
4. Select **Board**: ESP32 Dev Module (or your specific ESP32 board)
5. Select **Port**: Your ESP32's COM port
6. Click **Upload**
7. Open **Serial Monitor** (115200 baud)

**Expected Serial Output:**
```
========================================
ESP32 FireBot - BLE to I²C Bridge
========================================
✅ I²C Master initialized
   SDA: GPIO 21
   SCL: GPIO 22
   Arduino Address: 0x08

🔍 Testing I²C connection to Arduino...
✅ Arduino Uno detected on I²C bus!

📡 Initializing BLE...
✅ BLE Service started

========================================
🤖 FireBot Ready!
========================================
Waiting for BLE connection...
```

### Step 3: Setup React Web App

1. Open terminal in project directory
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open browser to `http://localhost:5173`

**Browser Requirements:**
- Chrome, Edge, or Opera (Web Bluetooth support required)
- HTTPS or localhost
- Bluetooth enabled on your computer

---

## 📡 Communication Protocol

### Commands (React → ESP32 → Arduino)

| Command | Description | BLE Value | I²C Byte | Action |
|---------|-------------|-----------|----------|--------|
| Forward | Move forward | `'F'` | `0x46` | Both motors forward |
| Backward | Move backward | `'B'` | `0x42` | Both motors backward |
| Left | Turn left | `'L'` | `0x4C` | Left motor back, right forward |
| Right | Turn right | `'R'` | `0x52` | Left motor forward, right back |
| Stop | Stop all motors | `'S'` | `0x53` | All motors off |
| Pump ON | Activate pump | `'P1'` | `0x50` | Relay ON |
| Pump OFF | Deactivate pump | `'P0'` | `0x70` | Relay OFF |
| Extinguish | Autonomous mode | `'EXTINGUISH'` | `0x45` | Auto fire fighting |

### Status Data (Arduino → ESP32 → React)

**I²C Format (2 bytes):**
- Byte 0: Fire Status
  - `0` = No fire detected
  - `1` = Fire on left
  - `2` = Fire on right
  - `3` = Fire in front
- Byte 1: Pump Status
  - `0` = Pump OFF
  - `1` = Pump ON

**BLE Format (String):**
```
FIRE:X,DIST:0,PUMP:Y
```
- `FIRE`: 0 or 1 (fire detected)
- `DIST`: 0 (not used)
- `PUMP`: 0 or 1 (pump status)

---

## 🧪 Testing & Troubleshooting

### Test 1: I²C Connection

**On ESP32 Serial Monitor:**
```
✅ Arduino Uno detected on I²C bus!
```

**If you see:**
```
❌ Arduino Uno NOT detected!
```

**Solutions:**
1. Check wiring: SDA to SDA, SCL to SCL, GND to GND
2. Verify Arduino is powered and running
3. Check I²C address in both codes (should be 0x08)
4. Try swapping SDA/SCL wires (in case of mislabeling)

### Test 2: BLE Connection

1. Open React app in Chrome
2. Click "Connect to Robot"
3. Select "FireBot" from device list
4. Check ESP32 Serial Monitor for:
   ```
   📱 BLE Device Connected!
   ```

**If connection fails:**
- Enable Bluetooth on your computer
- Use Chrome/Edge/Opera browser
- Ensure you're on localhost or HTTPS
- Restart ESP32 and try again

### Test 3: Command Execution

1. Connect to robot via React app
2. Click "Forward" button
3. **Check ESP32 Serial Monitor:**
   ```
   📨 BLE Command Received: F
   ✅ Command 'F' sent to Arduino via I²C
      → Moving Forward
   ```
4. **Check Arduino Serial Monitor:**
   ```
   📨 Received: F
   ⬆️  Moving Forward
   ```

### Test 4: Sensor Feedback

1. Trigger a fire sensor (or simulate by connecting sensor pin to GND)
2. **Check Arduino Serial Monitor:**
   ```
   📤 Sent Status - Fire: 3, Pump: 0
   ```
3. **Check ESP32 Serial Monitor:**
   ```
   📊 Sensor Update - Fire: Front, Pump: OFF
   ```
4. **Check React App:** Status panel should show "Fire Detected"

---

## 🐛 Common Issues

### Issue: Motors not moving

**Possible Causes:**
1. Motor driver not powered
2. Wrong pin connections
3. Arduino not receiving commands

**Debug Steps:**
1. Check Arduino Serial Monitor for received commands
2. Verify motor driver connections
3. Test motors directly with Arduino example code

### Issue: Pump not activating

**Possible Causes:**
1. Relay module not powered
2. Wrong relay trigger (HIGH vs LOW)
3. Pump power supply issue

**Debug Steps:**
1. Check relay LED indicator
2. Test relay with separate Arduino sketch
3. Verify pump power supply

### Issue: Sensors not detecting fire

**Possible Causes:**
1. Sensor wiring incorrect
2. Sensor sensitivity not adjusted
3. Wrong sensor logic (HIGH vs LOW)

**Debug Steps:**
1. Check sensor LED indicators
2. Read sensor values in Arduino Serial Monitor
3. Adjust sensor potentiometer for sensitivity

### Issue: I²C communication errors

**Symptoms:**
```
❌ I²C Error: 2
```

**Error Codes:**
- `2`: NACK on address (Arduino not responding)
- `3`: NACK on data
- `4`: Other error

**Solutions:**
1. Verify common ground connection
2. Check I²C pull-up resistors (usually built-in)
3. Reduce I²C frequency if wires are long
4. Check for loose connections

---

## 🎯 Usage Instructions

### Manual Control Mode

1. **Connect**: Click "Connect to Robot" in React app
2. **Move**: Use arrow buttons to control direction
3. **Stop**: Click red stop button
4. **Pump**: Toggle pump ON/OFF as needed

### Autonomous Extinguish Mode

1. **Connect** to robot
2. Click **"EXTINGUISH FIRE"** button
3. Robot will:
   - Scan for fire using servo
   - Turn toward detected fire
   - Move forward when fire is in front
   - Activate pump when close to fire
   - Continue until fire is extinguished

To exit autonomous mode, send any manual command (Forward, Stop, etc.)

---

## 📊 Performance Specifications

- **BLE Range**: ~10 meters (line of sight)
- **I²C Speed**: 100 kHz (standard mode)
- **Command Latency**: ~50-100ms (React → Arduino)
- **Sensor Update Rate**: 500ms (2 Hz)
- **Max Continuous Operation**: Limited by battery capacity

---

## 🔐 Safety Notes

⚠️ **IMPORTANT SAFETY WARNINGS:**

1. **Electrical Safety**
   - Use appropriate power supplies for motors and pump
   - Never exceed component voltage ratings
   - Isolate high-current circuits from logic circuits

2. **Fire Safety**
   - Test water pump away from electronics
   - Ensure proper water containment
   - Never leave robot unattended during operation

3. **Mechanical Safety**
   - Secure all moving parts
   - Test in safe, open area first
   - Keep fingers away from motors and wheels

---

## 📚 Additional Resources

- **Web Bluetooth API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
- **ESP32 I²C**: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/i2c.html
- **Arduino Wire Library**: https://www.arduino.cc/reference/en/language/functions/communication/wire/

---

## 🤝 Support

If you encounter issues:
1. Check Serial Monitor outputs on both ESP32 and Arduino
2. Verify all wiring connections
3. Test each component individually
4. Review this guide's troubleshooting section

---

**Built with ❤️ for robotics education and fire safety**
