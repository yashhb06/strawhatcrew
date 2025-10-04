# 🚀 Quick Start: Connect ESP32 FireBot via Wi-Fi

## 📋 What You Need

- ✅ ESP32 with your FireBot hardware
- ✅ USB cable to program ESP32
- ✅ Arduino IDE installed
- ✅ Computer with Wi-Fi

## 🔧 Step 1: Install Arduino Libraries

1. Open **Arduino IDE**
2. Go to **Sketch → Include Library → Manage Libraries**
3. Install these 3 libraries:

   **Library 1: ESP32Servo**
   - Search: `ESP32Servo`
   - By: Kevin Harrington
   - Click **Install**

   **Library 2: WebSockets**
   - Search: `WebSockets`
   - By: Markus Sattler
   - Install version **2.3.6 or later**

   **Library 3: ArduinoJson**
   - Search: `ArduinoJson`
   - By: Benoit Blanchon
   - Install version **6.x** (NOT 7.x)

## 📝 Step 2: Prepare the ESP32 Code

1. Open the file: `esp32_firebot_wifi.ino` (in your project folder)

2. **Choose Wi-Fi Mode** - You have 2 options:

### Option A: Access Point Mode (EASIEST - Recommended for First Try)

The ESP32 creates its own Wi-Fi network. No router needed!

**In the code, make sure these lines are set:**
```cpp
bool apMode = true;  // ← Make sure this is true
const char* ssid = "FireBot";
const char* password = "12345678";
```

**What this does:**
- ESP32 creates a Wi-Fi network called "FireBot"
- Password is "12345678"
- ESP32's IP will be: `192.168.4.1`

### Option B: Station Mode (Connect to Your Home Wi-Fi)

ESP32 connects to your existing Wi-Fi network.

**In the code, change these lines:**
```cpp
bool apMode = false;  // ← Change to false
const char* ssid = "YourWiFiName";      // ← Your Wi-Fi name
const char* password = "YourWiFiPassword";  // ← Your Wi-Fi password
```

**Example:**
```cpp
bool apMode = false;
const char* ssid = "Home_WiFi_5G";
const char* password = "mypassword123";
```

## ⬆️ Step 3: Upload Code to ESP32

1. Connect ESP32 to computer via USB
2. In Arduino IDE:
   - **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
   - **Tools → Port → COM3** (or whichever port shows your ESP32)
   - **Tools → Upload Speed → 115200**
3. Click the **Upload** button (→)
4. Wait for "Done uploading"

## 🔍 Step 4: Find ESP32's IP Address

1. Open **Serial Monitor**: Tools → Serial Monitor
2. Set baud rate to **115200** (bottom right)
3. Press **Reset** button on ESP32
4. Look for these messages:

**If using Access Point Mode:**
```
🔥 Starting FireBot Access Point...
📡 AP IP address: 192.168.4.1
Connect to Wi-Fi: FireBot
Password: 12345678
🌐 WebSocket server started on port 81
🤖 FireBot Ready!
```
**Your IP is: `192.168.4.1`**

**If using Station Mode:**
```
🔥 Connecting to Wi-Fi...
.....
✅ Connected to Wi-Fi
📡 IP address: 192.168.1.105  ← THIS IS YOUR IP!
🌐 WebSocket server started on port 81
🤖 FireBot Ready!
```
**Write down this IP address!**

## 📱 Step 5: Connect Your Computer to ESP32

### If Using Access Point Mode:
1. On your computer, open Wi-Fi settings
2. Look for network: **FireBot**
3. Connect to it
4. Password: **12345678**
5. Wait for connection
6. You'll lose internet temporarily (that's normal!)

### If Using Station Mode:
1. Make sure your computer is connected to the **same Wi-Fi network** as ESP32
2. That's it! Both devices are on the same network

## 🌐 Step 6: Open the Web App

1. The web app should already be running at: `http://localhost:5173`
2. If not, open terminal in the project folder and run:
   ```bash
   npm run dev
   ```

## 🔗 Step 7: Connect Web App to ESP32

1. In the web app, click **"Connect to Bot"** button (top right)
2. An input field will appear
3. Enter your ESP32's IP address:
   - **Access Point Mode:** `192.168.4.1`
   - **Station Mode:** The IP from Serial Monitor (e.g., `192.168.1.105`)
4. Press **Enter** or click **Connect**
5. Wait a few seconds...
6. You should see: **"Connected to 192.168.4.1"** (green indicator)

## ✅ Step 8: Test the Connection

1. **Check Serial Monitor** - You should see:
   ```
   [0] Connected from 192.168.4.2
   ```

2. **Try a command** - Click the **Forward** button (↑)
   - Serial Monitor should show: `⬆️ Moving Forward`
   - Motors should move!

3. **Check sensor data** - Status panel should update with real-time fire detection

## 🎮 You're Connected! Now What?

- Use **arrow buttons** to control movement
- Click **Stop** (red square) to halt
- Toggle **Pump Control** to test water pump
- Watch **Status Panel** for fire detection

## ❌ Troubleshooting

### Problem: Can't find "FireBot" Wi-Fi network
**Solution:**
- Check ESP32 is powered on
- Check Serial Monitor shows "AP IP address"
- Make sure `apMode = true` in code
- Try restarting ESP32

### Problem: "Connection failed" in web app
**Solution:**
- Verify you're connected to FireBot Wi-Fi (or same network)
- Check IP address is correct
- Try pinging: `ping 192.168.4.1` in terminal
- Make sure ESP32 Serial Monitor shows "WebSocket server started"
- Disable firewall temporarily

### Problem: Connected but commands don't work
**Solution:**
- Check Serial Monitor for "Command received" messages
- Verify motor connections
- Check motor power supply
- Test motors with simple code first

### Problem: ESP32 keeps restarting
**Solution:**
- Use separate power for motors (not USB)
- Check for short circuits
- Add capacitors across motor terminals

### Problem: Can't upload code to ESP32
**Solution:**
- Hold **BOOT** button while clicking Upload
- Try different USB cable
- Check correct COM port selected
- Install CH340 or CP2102 drivers

## 📊 Connection Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green dot pulsing | Connected and working |
| 🔴 "Not Connected" | WebSocket disconnected |
| 🟡 Yellow warning | Connection unstable |

## 🔄 Switching Between Modes

**To switch from AP to Station mode:**
1. Change `apMode = false` in code
2. Set your Wi-Fi credentials
3. Re-upload to ESP32
4. Check Serial Monitor for new IP
5. Update IP in web app

**To switch back to AP mode:**
1. Change `apMode = true`
2. Re-upload to ESP32
3. Connect to "FireBot" Wi-Fi
4. Use IP: `192.168.4.1`

## 💡 Pro Tips

1. **Save the IP:** Bookmark or save ESP32's IP for quick access
2. **Mobile Control:** Works on phone browsers too!
3. **Battery Power:** Use battery pack for ESP32 when testing movement
4. **Serial Monitor:** Keep it open to debug issues
5. **Auto-reconnect:** Web app will try to reconnect if connection drops

## 🎯 Quick Reference

| Mode | Wi-Fi Network | ESP32 IP | Connect Computer To |
|------|---------------|----------|---------------------|
| **AP Mode** | FireBot (created by ESP32) | 192.168.4.1 | "FireBot" Wi-Fi |
| **Station Mode** | Your home Wi-Fi | Check Serial Monitor | Same Wi-Fi as ESP32 |

---

**Still having issues?** Check the detailed `WIFI_SETUP.md` guide!
