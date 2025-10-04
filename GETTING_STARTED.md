# 🚀 Getting Started with FireBot

Welcome! This guide will help you get your Fire Extinguishing Bot up and running in **under 1 hour**.

---

## 📚 Documentation Overview

Your project includes comprehensive documentation:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **GETTING_STARTED.md** | Quick start guide | **START HERE** |
| **I2C_INTEGRATION_GUIDE.md** | Complete setup instructions | Detailed assembly |
| **WIRING_DIAGRAM.md** | Visual wiring guide | Hardware assembly |
| **QUICK_REFERENCE.md** | Quick lookup card | During operation |
| **IMPLEMENTATION_CHECKLIST.md** | Step-by-step checklist | Verification |
| **COMPLETE_SYSTEM_OVERVIEW.md** | System architecture | Understanding design |
| **PROJECT_SUMMARY.md** | Implementation details | Technical reference |

---

## ⚡ 5-Minute Quick Start

### Prerequisites Check
- [ ] ESP32 and Arduino Uno available
- [ ] Arduino IDE installed
- [ ] Node.js installed (v16+)
- [ ] Chrome/Edge browser
- [ ] USB cables (2x)

### Step 1: Upload Arduino Code (2 min)
```bash
1. Open Arduino IDE
2. File → Open → arduino_uno_firebot_slave.ino
3. Tools → Board → Arduino Uno
4. Tools → Port → [Select your Arduino port]
5. Click Upload (➡️)
6. Wait for "Done uploading"
```

### Step 2: Upload ESP32 Code (2 min)
```bash
1. In Arduino IDE
2. File → Open → esp32_firebot_i2c_bridge.ino
3. Tools → Board → ESP32 Dev Module
4. Tools → Port → [Select your ESP32 port]
5. Click Upload (➡️)
6. Wait for "Done uploading"
```

### Step 3: Wire I²C Connection (1 min)
```
ESP32 GPIO 21 → Arduino A4 (Yellow wire)
ESP32 GPIO 22 → Arduino A5 (Green wire)
ESP32 GND     → Arduino GND (Black wire)
```
**⚠️ Common ground is CRITICAL!**

### Step 4: Start Web App (2 min)
```bash
# Open terminal in project folder
npm install
npm run dev

# Open browser to http://localhost:5173
```

### Step 5: Connect & Test (1 min)
```bash
1. Click "Connect to Robot"
2. Select "FireBot" from list
3. Click Forward button
4. Success! 🎉
```

---

## 🔧 Full Setup (45 minutes)

### Phase 1: Hardware Preparation (15 min)

#### Gather Components
- ESP32 Development Board
- Arduino Uno
- L298N Motor Driver
- 2x DC Motors
- Water Pump + Relay
- Servo Motor
- 3x IR Flame Sensors
- Jumper wires
- 12V Power Supply (2A)

#### Assemble Robot Chassis
1. Mount Arduino Uno on chassis
2. Mount ESP32 near Arduino
3. Install motor driver
4. Attach motors to wheels
5. Mount sensors (left, right, forward)
6. Install water pump and reservoir

### Phase 2: Wiring (20 min)

Follow the complete wiring guide in `WIRING_DIAGRAM.md`:

#### Critical Connections (Do First!)
```
I²C Connection:
ESP32 GPIO21 → Arduino A4 (SDA)
ESP32 GPIO22 → Arduino A5 (SCL)
ESP32 GND → Arduino GND ⚠️ MANDATORY
```

#### Motor Connections
```
Arduino D5 → L298N IN1
Arduino D6 → L298N IN2
Arduino D7 → L298N IN3
Arduino D8 → L298N IN4

L298N OUT1/OUT2 → Left Motor
L298N OUT3/OUT4 → Right Motor
```

#### Sensor Connections
```
Arduino D2 → Left Fire Sensor OUT
Arduino D3 → Right Fire Sensor OUT
Arduino D4 → Forward Fire Sensor OUT
Arduino 5V → All Sensor VCC
Arduino GND → All Sensor GND
```

#### Pump & Servo
```
Arduino D9 → Relay IN
Arduino D10 → Servo Signal
Arduino 5V → Relay VCC, Servo VCC
Arduino GND → Relay GND, Servo GND
```

#### Power
```
12V Supply (+) → L298N 12V, Relay COM
12V Supply (-) → L298N GND, Common GND
```

### Phase 3: Software Upload (10 min)

#### Arduino Uno
1. Open `arduino_uno_firebot_slave.ino`
2. Select Board: Arduino Uno
3. Select Port
4. Upload
5. Open Serial Monitor (9600 baud)
6. Verify: "Arduino Uno - FireBot I²C Slave"

#### ESP32
1. Open `esp32_firebot_i2c_bridge.ino`
2. Select Board: ESP32 Dev Module
3. Select Port
4. Upload
5. Open Serial Monitor (115200 baud)
6. Verify: "✅ Arduino Uno detected on I²C bus!"

#### React App
```bash
cd firebot-controller
npm install
npm run dev
```

### Phase 4: Testing (10 min)

Use `IMPLEMENTATION_CHECKLIST.md` for complete testing procedure.

#### Quick Tests
1. **I²C Test**: ESP32 Serial shows "Arduino detected"
2. **BLE Test**: React app connects to "FireBot"
3. **Motor Test**: Forward button moves motors
4. **Sensor Test**: Cover sensor, status updates
5. **Pump Test**: Pump toggle activates relay

---

## 🎮 Using Your FireBot

### Manual Control Mode

1. **Connect**
   - Open http://localhost:5173
   - Click "Connect to Robot"
   - Select "FireBot"

2. **Movement**
   - ⬆️ Forward
   - ⬇️ Backward
   - ⬅️ Left
   - ➡️ Right
   - ⏹️ Stop

3. **Pump Control**
   - Click "Turn Pump ON" (green)
   - Click "Turn Pump OFF" (gray)

### Autonomous Mode

1. Click **"EXTINGUISH FIRE"** (orange button)
2. Robot will:
   - Scan for fire using servo
   - Turn toward detected fire
   - Move forward when fire is in front
   - Activate pump automatically
   - Continue until fire extinguished

3. Exit autonomous mode:
   - Press any manual control button

### Status Monitoring

Watch the Status Panel for:
- **Fire Detection**: Green (none) / Red (detected)
- **Pump Status**: OFF / ON
- **Connection**: Connected / Disconnected

---

## 🐛 Troubleshooting

### Problem: ESP32 doesn't detect Arduino

**Solution:**
```
1. Check I²C wiring (SDA, SCL, GND)
2. Verify Arduino is powered and running
3. Restart both devices
4. Check Serial Monitor on Arduino (should show "Waiting for commands")
```

### Problem: Can't connect via Bluetooth

**Solution:**
```
1. Use Chrome, Edge, or Opera browser
2. Enable Bluetooth on your computer
3. Ensure on localhost or HTTPS
4. Restart ESP32
5. Refresh browser page
```

### Problem: Motors don't move

**Solution:**
```
1. Check motor driver power (12V connected?)
2. Verify motor driver wiring
3. Check Serial Monitors (commands reaching Arduino?)
4. Test motors with separate sketch
```

### Problem: Sensors don't detect fire

**Solution:**
```
1. Check sensor wiring (VCC, GND, OUT)
2. Adjust sensor sensitivity (potentiometer)
3. Test with lighter/candle
4. Check Serial Monitor for sensor readings
```

---

## 📖 Next Steps

### After Basic Setup
1. ✅ Test all manual controls
2. ✅ Calibrate fire sensors
3. ✅ Test autonomous mode
4. ✅ Adjust servo sweep range
5. ✅ Fine-tune motor speeds

### Enhancements
- Add distance sensor for obstacle avoidance
- Implement PWM speed control
- Add battery monitoring
- Create mobile app version
- Add camera for live video

### Learning More
- Read `COMPLETE_SYSTEM_OVERVIEW.md` for architecture
- Study `I2C_INTEGRATION_GUIDE.md` for protocol details
- Review code comments for implementation details

---

## 🎓 Understanding the System

### Communication Flow

```
User clicks button
    ↓
React sends BLE command
    ↓
ESP32 receives via Bluetooth
    ↓
ESP32 sends via I²C
    ↓
Arduino receives and executes
    ↓
Motors/Pump respond
```

### Why This Architecture?

1. **ESP32**: Has Bluetooth, handles wireless communication
2. **Arduino Uno**: Reliable motor control, real-time sensor reading
3. **I²C**: Fast, reliable communication between microcontrollers
4. **React**: Modern, responsive web interface

---

## 🔐 Safety First

### Before Operating
- [ ] All wiring secure and insulated
- [ ] Power supplies correct voltage
- [ ] Water pump tested away from electronics
- [ ] Emergency stop accessible
- [ ] Testing area clear and safe

### During Operation
- [ ] Monitor for overheating
- [ ] Watch for water leaks
- [ ] Keep fire extinguisher nearby
- [ ] Never leave unattended
- [ ] Stop immediately if issues arise

---

## 📞 Getting Help

### Check These First
1. **Serial Monitors**: Both ESP32 and Arduino
2. **Browser Console**: F12 in browser
3. **Wiring**: Compare to `WIRING_DIAGRAM.md`
4. **Documentation**: Review relevant guide

### Common Issues
- See `QUICK_REFERENCE.md` → Troubleshooting section
- See `I2C_INTEGRATION_GUIDE.md` → Testing & Troubleshooting
- Check `IMPLEMENTATION_CHECKLIST.md` for missed steps

---

## 🎉 Success!

Once everything is working:
1. ✅ Take photos/videos of your robot
2. ✅ Test in various scenarios
3. ✅ Share your project
4. ✅ Consider enhancements
5. ✅ Help others build theirs!

---

## 📋 Quick Command Reference

### Terminal Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

### Robot Commands
```
F  - Forward
B  - Backward
L  - Left
R  - Right
S  - Stop
P1 - Pump ON
P0 - Pump OFF
EXTINGUISH - Autonomous mode
```

### Serial Monitor Settings
```
Arduino: 9600 baud
ESP32: 115200 baud
```

---

## 🏆 You're Ready!

Your FireBot is ready to:
- 🎮 Respond to manual controls
- 🔥 Detect fires automatically
- 💧 Extinguish fires autonomously
- 📱 Connect wirelessly via Bluetooth
- 📊 Provide real-time status updates

**Go save the world, one fire at a time! 🔥🤖💧**

---

**Built with ❤️ by Strawhat Crew 🏴‍☠️**

*Need more details? Check the other documentation files!*
