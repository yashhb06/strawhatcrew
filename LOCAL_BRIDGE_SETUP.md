# 🔥 FireBot Local Bluetooth Bridge Setup Guide

## 📋 Overview

This guide explains how to set up and use the **Local Bluetooth Bridge** for your FireBot controller. This replaces the Web Bluetooth API with a local server that communicates with ESP32 via Bluetooth.

### Why Local Bridge?

✅ **Works on all browsers** (not just Chrome/Edge)  
✅ **No HTTPS required**  
✅ **Better reliability** and error handling  
✅ **Works on Firefox, Safari, and all browsers**  
✅ **Easier debugging** with server logs  

---

## 🏗️ New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          React Web Application                        │  │
│  │  • Movement Controls (↑↓←→⏹)                         │  │
│  │  • Pump Control (💧 ON/OFF)                          │  │
│  │  • Auto/Manual Mode Toggle                           │  │
│  │  • Real-time Status Display                          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/WebSocket (localhost:5000)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LOCAL BLUETOOTH BRIDGE                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Python Flask / Node.js Express Server             │  │
│  │  • REST API Endpoints                                 │  │
│  │  • WebSocket for real-time updates                   │  │
│  │  • Bluetooth Serial communication                    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Bluetooth Serial/Classic
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ESP32 FIREBOT                            │
│  • Receives commands via Bluetooth                          │
│  • Sends commands to Arduino via I²C                        │
│  • Sends sensor data back via Bluetooth                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ I²C (SDA/SCL)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   ARDUINO UNO                               │
│  • Controls motors, pump, servo                             │
│  • Reads fire sensors                                       │
│  • Executes commands                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Server Dependencies

Choose **Python** OR **Node.js** (both work the same):

#### Option A: Python Server (Recommended for Windows)

```bash
cd server
pip install -r requirements.txt
```

#### Option B: Node.js Server

```bash
cd server
npm install
```

### Step 2: Start the Local Bridge Server

#### Python:
```bash
cd server
python bluetooth_bridge.py
```

#### Node.js:
```bash
cd server
npm start
```

**Expected Output:**
```
==================================================
🔥 FireBot Local Bluetooth Bridge Server
==================================================
Server running on: http://localhost:5000
WebSocket available on: ws://localhost:5000

Endpoints:
  POST /api/connect       - Connect to ESP32
  POST /api/disconnect    - Disconnect from ESP32
  POST /api/send-command  - Send command to robot
  GET  /api/status        - Get robot status
  GET  /api/health        - Server health check

Press Ctrl+C to stop
==================================================
```

### Step 3: Start React App

```bash
npm run dev
```

Open browser to `http://localhost:5173`

---

## 🔧 Configuration

### Python Server Configuration

Edit `server/bluetooth_bridge.py`:

```python
ESP32_NAME = "FireBot"  # Change if your ESP32 has different name
```

### Node.js Server Configuration

Edit `server/bluetooth_bridge.js`:

```javascript
const BLUETOOTH_PORT = 'COM3';  // Change to your ESP32 COM port
const BAUD_RATE = 115200;
```

**Finding your COM port:**
- **Windows**: Device Manager → Ports (COM & LPT)
- **Mac/Linux**: `ls /dev/tty.*` or `ls /dev/cu.*`

---

## 📡 API Endpoints

### POST /api/connect
Connect to ESP32 via Bluetooth

**Request:**
```bash
curl -X POST http://localhost:5000/api/connect
```

**Response:**
```json
{
  "success": true,
  "connected": true,
  "message": "Connected to FireBot"
}
```

### POST /api/disconnect
Disconnect from ESP32

**Request:**
```bash
curl -X POST http://localhost:5000/api/disconnect
```

### POST /api/send-command
Send command to robot

**Request:**
```bash
curl -X POST http://localhost:5000/api/send-command \
  -H "Content-Type: application/json" \
  -d '{"command": "F"}'
```

**Commands:**
- `F` - Forward
- `B` - Backward
- `L` - Left
- `R` - Right
- `S` - Stop
- `P1` - Pump ON
- `P0` - Pump OFF
- `EXTINGUISH` - Autonomous mode

### GET /api/status
Get current robot status

**Response:**
```json
{
  "connected": true,
  "sensorData": {
    "fireDetected": false,
    "pumpStatus": false,
    "connected": true
  }
}
```

### GET /api/health
Server health check

**Response:**
```json
{
  "status": "running",
  "server": "FireBot Bluetooth Bridge",
  "version": "1.0.0"
}
```

---

## 🔌 WebSocket Events

### Client → Server

**send_command**
```javascript
socket.emit('send_command', { command: 'F' });
```

### Server → Client

**connection_status**
```javascript
socket.on('connection_status', (data) => {
  console.log('Connected:', data.connected);
});
```

**sensor_data**
```javascript
socket.on('sensor_data', (data) => {
  console.log('Fire:', data.fireDetected);
  console.log('Pump:', data.pumpStatus);
});
```

**command_response**
```javascript
socket.on('command_response', (data) => {
  console.log('Command:', data.command, 'Success:', data.success);
});
```

---

## 🎮 Using the Web Interface

### 1. Start Server
```bash
cd server
python bluetooth_bridge.py  # or: npm start
```

### 2. Start React App
```bash
npm run dev
```

### 3. Connect to Robot
1. Open `http://localhost:5173` in any browser
2. Click **"Connect to Robot"** button
3. Server will connect to ESP32 via Bluetooth
4. Green indicator shows when connected ✅

### 4. Control Robot

**Manual Mode:**
- Use arrow buttons (↑↓←→) for movement
- Click ⏹️ to stop
- Toggle 💧 for pump control

**Auto Mode:**
- Flip toggle switch to **Auto**
- Robot enters autonomous fire-fighting mode
- Manual controls disabled
- Robot automatically seeks and extinguishes fires

---

## 🐛 Troubleshooting

### Server won't start

**Error:** `Address already in use`

**Solution:**
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Can't connect to ESP32

**Error:** `Bluetooth connection failed`

**Solutions:**
1. **Check ESP32 is powered on** and running code
2. **Pair ESP32 with computer** first (Windows Bluetooth settings)
3. **Check COM port** in server configuration
4. **Verify ESP32 name** matches `ESP32_NAME` in server

**Windows Pairing:**
1. Settings → Bluetooth & devices
2. Add device → Bluetooth
3. Select "FireBot"
4. Note the COM port assigned

### React app can't connect to server

**Error:** `Local server not running`

**Solutions:**
1. **Start the server first** before React app
2. **Check server is running** on port 5000
3. **Test server health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

### No sensor data updates

**Solutions:**
1. **Check ESP32 Serial Monitor** - should show sensor data
2. **Verify I²C connection** between ESP32 and Arduino
3. **Check server logs** for incoming data
4. **Restart both server and ESP32**

---

## 📊 Comparison: Web Bluetooth vs Local Bridge

| Feature | Web Bluetooth API | Local Bridge |
|---------|-------------------|--------------|
| Browser Support | Chrome, Edge only | All browsers |
| HTTPS Required | Yes | No |
| Setup Complexity | Low | Medium |
| Reliability | Good | Excellent |
| Debugging | Limited | Full server logs |
| Range | ~10m | Same as Bluetooth |
| Latency | ~50ms | ~50-100ms |
| Works Offline | Yes | Yes (localhost) |

---

## 🔄 Migration from Web Bluetooth

### What Changed

✅ **Removed:**
- `src/services/bluetoothService.ts` (Web Bluetooth API)
- Direct browser Bluetooth pairing

✅ **Added:**
- `src/services/localServerService.ts` (HTTP/WebSocket client)
- `server/bluetooth_bridge.py` (Python server)
- `server/bluetooth_bridge.js` (Node.js server)
- `socket.io-client` dependency

✅ **Preserved:**
- All UI components (Header, ControlPanel, StatusPanel)
- All functionality (manual control, auto mode, pump control)
- All styling and responsiveness
- Real-time sensor updates
- Error handling

### Code Changes

**Before (Web Bluetooth):**
```typescript
import { bluetoothService } from './services/bluetoothService';

await bluetoothService.connect();  // Browser Bluetooth dialog
```

**After (Local Bridge):**
```typescript
import { localServerService } from './services/localServerService';

await localServerService.connect();  // Server connects to ESP32
```

---

## 📝 Development Workflow

### Normal Development

1. **Terminal 1:** Start server
   ```bash
   cd server
   python bluetooth_bridge.py
   ```

2. **Terminal 2:** Start React app
   ```bash
   npm run dev
   ```

3. **Browser:** Open `http://localhost:5173`

### With Auto-Reload (Node.js)

```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

---

## 🎯 Next Steps

1. ✅ **Test connection** - Connect to ESP32 and verify controls work
2. ✅ **Test sensors** - Trigger fire sensors and check status updates
3. ✅ **Test auto mode** - Switch to autonomous mode and verify behavior
4. ✅ **Check logs** - Monitor server console for debugging

---

## 📚 Additional Resources

- **Server Code:** `server/bluetooth_bridge.py` or `bluetooth_bridge.js`
- **React Service:** `src/services/localServerService.ts`
- **ESP32 Code:** `esp32_firebot_i2c_bridge.ino`
- **Arduino Code:** `arduino_uno_firebot_slave.ino`

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] React app connects to server (localhost:5000)
- [ ] Server connects to ESP32 via Bluetooth
- [ ] Manual controls work (↑↓←→⏹)
- [ ] Pump control works (💧)
- [ ] Auto mode works (🔥 EXTINGUISH)
- [ ] Sensor data updates in real-time
- [ ] Connection status shows correctly

---

**🎉 You're all set! Your FireBot now uses the Local Bluetooth Bridge!**

*Built with ❤️ by Strawhat Crew 🏴‍☠️*
