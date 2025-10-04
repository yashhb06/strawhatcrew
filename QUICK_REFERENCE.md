# 🔥 FireBot Quick Reference Card

## 🚀 Quick Start (5 Steps)

```bash
# 1. Upload Arduino Code
# Open arduino_uno_firebot_slave.ino in Arduino IDE → Upload to Arduino Uno

# 2. Upload ESP32 Code  
# Open esp32_firebot_i2c_bridge.ino in Arduino IDE → Upload to ESP32

# 3. Wire I²C Connection
# ESP32 GPIO21 → Arduino A4 (SDA)
# ESP32 GPIO22 → Arduino A5 (SCL)
# ESP32 GND → Arduino GND (CRITICAL!)

# 4. Start React App
npm install
npm run dev

# 5. Connect in Browser
# Open http://localhost:5173 → Click "Connect to Robot"
```

---

## 📡 BLE UUIDs (Copy to React App if needed)

```typescript
SERVICE_UUID:        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
MOVEMENT_CHAR_UUID:  "beb5483e-36e1-4688-b7f5-ea07361b26a8"
PUMP_CHAR_UUID:      "beb5483e-36e1-4688-b7f5-ea07361b26a9"
SENSOR_CHAR_UUID:    "beb5483e-36e1-4688-b7f5-ea07361b26aa"
```

---

## 🎮 Control Commands

| Button | Command | BLE | I²C | Action |
|--------|---------|-----|-----|--------|
| ⬆️ Forward | F | `'F'` | 0x46 | Both motors forward |
| ⬇️ Backward | B | `'B'` | 0x42 | Both motors backward |
| ⬅️ Left | L | `'L'` | 0x4C | Turn left |
| ➡️ Right | R | `'R'` | 0x52 | Turn right |
| ⏹️ Stop | S | `'S'` | 0x53 | Stop all motors |
| 💧 Pump ON | P1 | `'P1'` | 0x50 | Activate pump |
| 💧 Pump OFF | P0 | `'P0'` | 0x70 | Deactivate pump |
| 🔥 Extinguish | EXTINGUISH | `'EXTINGUISH'` | 0x45 | Autonomous mode |

---

## 🔌 Pin Connections

### ESP32
```
GPIO 21 → Arduino A4 (SDA)
GPIO 22 → Arduino A5 (SCL)
GND     → Arduino GND
```

### Arduino Uno
```
A4 (SDA)  → ESP32 GPIO 21
A5 (SCL)  → ESP32 GPIO 22
D2        → Left Fire Sensor
D3        → Right Fire Sensor
D4        → Forward Fire Sensor
D5        → Motor Driver IN1
D6        → Motor Driver IN2
D7        → Motor Driver IN3
D8        → Motor Driver IN4
D9        → Pump Relay
D10       → Servo Motor
GND       → ESP32 GND + All Components
```

---

## 🐛 Troubleshooting

### ❌ I²C Not Working
```
Check: Common ground connected?
Check: SDA/SCL not swapped?
Check: Arduino code uploaded and running?
Fix: Restart both devices
```

### ❌ BLE Won't Connect
```
Check: Using Chrome/Edge/Opera?
Check: On localhost or HTTPS?
Check: Bluetooth enabled?
Fix: Restart ESP32, refresh browser
```

### ❌ Motors Not Moving
```
Check: Motor driver powered (12V)?
Check: Motor driver connections correct?
Check: Commands reaching Arduino? (Serial Monitor)
Fix: Test motors with separate sketch
```

### ❌ Sensors Not Detecting
```
Check: Sensor wiring correct?
Check: Sensors powered (5V)?
Adjust: Sensor sensitivity potentiometer
Test: Cover sensor, check Serial Monitor
```

---

## 📊 Serial Monitor Output

### Arduino (9600 baud)
```
========================================
Arduino Uno - FireBot I²C Slave
========================================
I²C Address: 0x08
Waiting for commands from ESP32...
========================================

📨 Received: F
⬆️  Moving Forward
📤 Sent Status - Fire: 0, Pump: 0
```

### ESP32 (115200 baud)
```
========================================
ESP32 FireBot - BLE to I²C Bridge
========================================
✅ I²C Master initialized
✅ Arduino Uno detected on I²C bus!
✅ BLE Service started
========================================
🤖 FireBot Ready!
========================================

📱 BLE Device Connected!
📨 BLE Command Received: F
✅ Command 'F' sent to Arduino via I²C
   → Moving Forward
📊 Sensor Update - Fire: None, Pump: OFF
```

---

## 🔋 Power Requirements

```
Component          Voltage    Current
─────────────────────────────────────
ESP32              5V         500mA (USB)
Arduino Uno        5V         500mA (USB)
DC Motors          12V        1-2A
Water Pump         12V        500mA
Fire Sensors       5V         50mA (from Arduino)
Servo Motor        5V         100mA (from Arduino)
─────────────────────────────────────
Total              12V 2A + 5V 1A
```

---

## 📱 React App Features

### Connection
- Click "Connect to Robot"
- Select "FireBot" from list
- Green indicator when connected

### Manual Control
- Arrow buttons for movement
- Red stop button for emergency halt
- Pump toggle (green when ON)

### Autonomous Mode
- Orange "EXTINGUISH FIRE" button
- Robot automatically seeks and extinguishes fire
- Exit by pressing any manual control

### Status Display
- Fire detection indicator
- Pump status
- Real-time updates (500ms)

---

## 🎯 Testing Sequence

```
1. ✅ Power on both devices
2. ✅ Check Serial Monitors (both should show "Ready")
3. ✅ Open React app in browser
4. ✅ Click "Connect to Robot"
5. ✅ Test Forward → Should see in both Serial Monitors
6. ✅ Test Stop → Motors should halt
7. ✅ Test Pump → Relay should click
8. ✅ Trigger fire sensor → Status should update in app
9. ✅ Test EXTINGUISH → Robot should scan and respond
10. ✅ All working? You're ready to go! 🎉
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `I2C_INTEGRATION_GUIDE.md` | Complete setup guide |
| `WIRING_DIAGRAM.md` | Detailed wiring instructions |
| `PROJECT_SUMMARY.md` | Implementation summary |
| `QUICK_REFERENCE.md` | This file - quick lookup |

---

## ⚡ Common Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Install Dependencies
```bash
npm install
```

---

## 🔐 Safety Reminders

- ⚠️ Never touch wires while powered
- ⚠️ Test water pump away from electronics
- ⚠️ Use appropriate power supplies
- ⚠️ Keep fire extinguisher nearby during tests
- ⚠️ Test in safe, open area first

---

## 📞 Need Help?

1. Check Serial Monitors on both devices
2. Review `I2C_INTEGRATION_GUIDE.md` troubleshooting section
3. Verify all wiring against `WIRING_DIAGRAM.md`
4. Test each component individually
5. Check browser console for JavaScript errors

---

## 🎓 Learning Resources

- **Web Bluetooth API**: https://web.dev/bluetooth/
- **ESP32 I²C**: https://docs.espressif.com/projects/arduino-esp32/
- **Arduino Wire Library**: https://www.arduino.cc/reference/en/language/functions/communication/wire/
- **React Docs**: https://react.dev/

---

**Keep this card handy while working on your FireBot! 🔥🤖**
