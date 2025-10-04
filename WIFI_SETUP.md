# 🌐 ESP32 FireBot Wi-Fi Setup Guide

## 📋 Overview

This guide will help you set up your FireBot to work with the Wi-Fi/WebSocket controller instead of Bluetooth.

## 📚 Required Libraries

Install these libraries in Arduino IDE:

1. **ESP32Servo** - For servo control
   - Sketch → Include Library → Manage Libraries
   - Search "ESP32Servo" by Kevin Harrington

2. **WebSockets** - For WebSocket server
   - Search "WebSockets" by Markus Sattler
   - Install version 2.3.6 or later

3. **ArduinoJson** - For JSON parsing
   - Search "ArduinoJson" by Benoit Blanchon
   - Install version 6.x

## 🔧 Configuration Options

### Option 1: Access Point Mode (Recommended for Testing)

The ESP32 creates its own Wi-Fi network that you connect to.

**In the code:**
```cpp
bool apMode = true;
const char* ssid = "FireBot";
const char* password = "12345678";
```

**Steps:**
1. Upload code to ESP32
2. ESP32 creates Wi-Fi network "FireBot"
3. Connect your computer/phone to "FireBot" Wi-Fi (password: 12345678)
4. Open web app and connect to IP: `192.168.4.1`

**Pros:**
- ✅ No router needed
- ✅ Direct connection
- ✅ Works anywhere

**Cons:**
- ❌ Limited range
- ❌ Computer loses internet while connected

### Option 2: Station Mode (For Permanent Setup)

The ESP32 connects to your existing Wi-Fi network.

**In the code:**
```cpp
bool apMode = false;
const char* ssid = "YourWiFiName";      // Change this!
const char* password = "YourPassword";   // Change this!
```

**Steps:**
1. Change SSID and password in code
2. Upload to ESP32
3. Open Serial Monitor to see assigned IP address
4. Connect web app to that IP address

**Pros:**
- ✅ Both devices on same network
- ✅ Computer keeps internet
- ✅ Better range

**Cons:**
- ❌ Requires Wi-Fi router
- ❌ IP address may change

## 🚀 Upload Instructions

1. Open `esp32_firebot_wifi.ino` in Arduino IDE
2. Install required libraries (see above)
3. Configure Wi-Fi settings (AP or Station mode)
4. Select board: Tools → Board → ESP32 Dev Module
5. Select correct COM port
6. Click Upload
7. Open Serial Monitor (115200 baud)
8. Note the IP address shown

## 📡 WebSocket Communication

### Connection
- **WebSocket URL:** `ws://[ESP32_IP]:81`
- **Default IP (AP mode):** `192.168.4.1`
- **Port:** `81`

### Commands (Text Messages)
Send these single-character commands:
- `F` - Forward
- `B` - Backward
- `L` - Left
- `R` - Right
- `S` - Stop
- `P1` - Pump ON
- `P0` - Pump OFF

### Sensor Data (JSON)
ESP32 sends this every 500ms:
```json
{
  "fire": false,
  "pump": false
}
```

## 🖥️ Web App Configuration

In the React app, you can change the default IP:

**File:** `src/services/websocketService.ts`
```typescript
private esp32Ip: string = '192.168.4.1'; // Change this
private port: string = '81';
```

Or enter it dynamically in the UI when connecting.

## 🔍 Finding ESP32 IP Address

### Method 1: Serial Monitor
1. Open Serial Monitor in Arduino IDE
2. Reset ESP32
3. Look for line: `📡 IP address: 192.168.x.x`

### Method 2: Router Admin Panel
1. Log into your router (usually 192.168.1.1)
2. Look for connected devices
3. Find device named "ESP32" or with MAC starting with ESP32's MAC

### Method 3: Network Scanner
Use apps like:
- **Fing** (Mobile)
- **Advanced IP Scanner** (Windows)
- **Angry IP Scanner** (Cross-platform)

## 🧪 Testing the Connection

### Test 1: Ping ESP32
```bash
ping 192.168.4.1
```
Should get replies if connected.

### Test 2: WebSocket Test
Use a WebSocket testing tool:
- **Browser:** Chrome DevTools Console
  ```javascript
  const ws = new WebSocket('ws://192.168.4.1:81');
  ws.onopen = () => console.log('Connected!');
  ws.onmessage = (e) => console.log('Data:', e.data);
  ws.send('F'); // Test forward command
  ```

### Test 3: Serial Monitor
Watch for:
```
[0] Connected from 192.168.4.2
[0] Command received: F
⬆️ Moving Forward
```

## 🎮 Operating Modes

### Manual Control (When WebSocket Connected)
- Full control from web app
- Autonomous fire detection disabled
- Real-time sensor data streaming

### Autonomous Mode (When Disconnected)
- Automatic fire detection
- Auto navigation
- Auto fire extinguishing

## 🔧 Troubleshooting

### Can't Connect to ESP32 Wi-Fi
- Check ESP32 is powered on
- Look for "FireBot" in Wi-Fi list
- Try password: `12345678`
- Check Serial Monitor for errors

### WebSocket Connection Failed
- Verify IP address is correct
- Check ESP32 Serial Monitor shows "WebSocket server started"
- Try pinging the IP first
- Disable firewall temporarily
- Make sure port 81 is not blocked

### Commands Not Working
- Check Serial Monitor for received commands
- Verify WebSocket is connected (green indicator)
- Check motor connections and power
- Test motors with simple code first

### No Sensor Data
- Check Serial Monitor for JSON output
- Verify flame sensors are connected
- Test sensors individually
- Check sensor power (3.3V or 5V)

### ESP32 Keeps Restarting
- Insufficient power supply
- Use separate power for motors
- Check for short circuits
- Add decoupling capacitors

## 🔋 Power Considerations

**Important:** Motors and pump draw high current!

- **ESP32:** 5V via USB or VIN (max 500mA)
- **Motors:** 6-12V via motor driver (1-2A)
- **Pump:** 12V (check specs, usually 1-3A)

**Recommended Setup:**
- USB power for ESP32 (for programming/debugging)
- Separate 12V battery for motors and pump
- Common ground between all power supplies

## 📱 Mobile Access

The web app works on mobile browsers too!

1. Connect phone to same Wi-Fi as ESP32
2. Open browser (Chrome recommended)
3. Navigate to `http://[ESP32_IP]:5173`
4. Connect to bot and control

## 🌐 Network Diagram

### Access Point Mode
```
[ESP32 FireBot]  ←→  [Your Computer]
   192.168.4.1         192.168.4.2
```

### Station Mode
```
[Router]
    ↓
    ├── [ESP32 FireBot] (192.168.1.100)
    └── [Your Computer] (192.168.1.50)
```

## 🎯 Quick Start Checklist

- [ ] Install required libraries
- [ ] Configure Wi-Fi mode (AP or Station)
- [ ] Upload code to ESP32
- [ ] Note IP address from Serial Monitor
- [ ] Connect computer to same network
- [ ] Open web app
- [ ] Enter ESP32 IP and connect
- [ ] Test movement controls
- [ ] Test pump control
- [ ] Verify sensor data updates

## 🆚 BLE vs Wi-Fi Comparison

| Feature | BLE | Wi-Fi |
|---------|-----|-------|
| Range | ~10m | ~50m+ |
| Setup | Pairing required | IP address needed |
| Browser Support | Limited (Chrome only) | All browsers |
| Mobile | Good | Excellent |
| Latency | Low | Very Low |
| Data Rate | Low | High |
| Power | Lower | Higher |

## 📝 Next Steps

1. Test basic connection
2. Verify all controls work
3. Test autonomous mode
4. Calibrate sensors
5. Add battery monitoring (optional)
6. Implement auto-reconnect (optional)

---

**Need Help?** Check Serial Monitor for debug messages!
