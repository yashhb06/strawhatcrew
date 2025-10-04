# 🔥 Fire Extinguishing Robot – IoT Project  
**Team:** 🏴‍☠️ Strawhat Crew  

## 🔥 FireBot Controller

A complete React-based control system for an IoT Fire Extinguishing Robot with full integration:
- **React Web App** → Bluetooth (BLE) → **ESP32** → I²C → **Arduino Uno** → Motors/Sensors/Pump

Control your fire-fighting robot through a modern web interface with real-time sensor feedback!

## 📌 Project Overview  
This project is an **IoT-based Fire Extinguishing Robot** designed to detect and extinguish fire automatically. The robot uses **flame sensors**, **servo motor**, and a **water pump system** mounted on a moving chassis. It can:  
- Detect fire using flame sensors  
- Move in different directions (left, right, forward)  
- Activate a water pump to extinguish fire  
- Sweep the nozzle using a servo for effective spraying  

The robot combines **embedded systems (Arduino/ESP32)** with potential **remote control via React web app** (future extension).  

---

## ⚙️ Components Used  
- **ESP32 / Arduino Uno** (Microcontroller)  
- **Servo Motor (SG90)** – for sweeping water nozzle  
- **DC Motors** – for movement  
- **Motor Driver (L293D / L298N)**  
- **Flame Sensors** – left, right, and forward  
- **Mini Water Pump** – extinguishes fire  
- **Chassis + Wheels**  
- **Power Supply** (Battery Pack)  

---

## 🧑‍💻 Code Functionality  

### 🔹 Fire Detection  
- Reads inputs from **3 flame sensors** (Left, Right, Front).  
- Based on sensor output, decides whether to move left, right, forward, or activate extinguishing.  

### 🔹 Movement Control  
- Motors controlled using `LM1, LM2, RM1, RM2` pins.  
- Functions: `moveForward()`, `turnLeft()`, `turnRight()`, `stopMotors()`.  

### 🔹 Extinguishing  
- When fire detected in front:  
  - Robot stops → Pump activates  
  - Servo sweeps nozzle left-to-right (60° to 120°)  
  - Pump sprays water for 5 seconds  
  - Pump stops after extinguishing  

---

## 📝 Pin Configuration  

| Component        | Pin |  
|------------------|-----|  
| Left Flame Sensor  | 4   |  
| Right Flame Sensor | 3   |  
| Front Flame Sensor | 5   |  
| Left Motor (LM1)   | 8   |  
| Left Motor (LM2)   | 9   |  
| Right Motor (RM1)  | 6   |  
| Right Motor (RM2)  | 7   |  
| Pump               | 10  |  
| Servo              | 12  |  

---

## 🚀 How It Works  
1. Robot continuously scans environment with flame sensors.  
2. If fire is detected on **front**, bot stops → activates pump → sweeps nozzle.  
3. If fire is on **left or right**, bot turns in that direction.  
4. If **no fire detected**, bot moves forward.  

---

## 🛠️ Future Enhancements  
- 🔗 Remote Control Interface using **React + WebSockets** for manual operation.  
- 📡 IoT integration with **Firebase/MQTT** to log fire detection events.  
- 🎥 Adding camera module for **live video streaming**.  
- 🧠 AI-based fire detection with **Computer Vision**.  

---

## 🔗 I²C Integration Architecture

This project uses a **three-tier architecture** for complete separation of concerns:

```
React Web App (UI)
      ↓ Bluetooth (BLE)
ESP32 (Communication Bridge)
      ↓ I²C (SDA/SCL)
Arduino Uno (Motor Controller)
      ↓ GPIO
Motors, Sensors, Pump
```

### Why This Architecture?

1. **ESP32** handles wireless communication (BLE) - it has built-in Bluetooth
2. **Arduino Uno** handles real-time motor control and sensor reading
3. **I²C** provides reliable, fast communication between the two microcontrollers
4. **React App** provides a modern, responsive user interface

### Key Files

- **`arduino_uno_firebot_slave.ino`** - Arduino code (I²C slave, motor control)
- **`esp32_firebot_i2c_bridge.ino`** - ESP32 code (BLE + I²C master)
- **`src/`** - React web application
- **`I2C_INTEGRATION_GUIDE.md`** - Complete setup instructions
- **`WIRING_DIAGRAM.md`** - Detailed wiring guide

### Quick Start

1. **Upload Arduino Code**: Flash `arduino_uno_firebot_slave.ino` to Arduino Uno
2. **Upload ESP32 Code**: Flash `esp32_firebot_i2c_bridge.ino` to ESP32
3. **Wire I²C Connection**: 
   - ESP32 GPIO 21 → Arduino A4 (SDA)
   - ESP32 GPIO 22 → Arduino A5 (SCL)
   - Common Ground (CRITICAL!)
4. **Start React App**: `npm install && npm run dev`
5. **Connect**: Open browser, click "Connect to Robot"

📖 **See `I2C_INTEGRATION_GUIDE.md` for complete setup instructions**

---

## 🎯 Team  
**Strawhat Crew** 🏴‍☠️  
- Captain: Monkey D. Luffy 🍖  
- First Mate: Roronoa Zoro ⚔️  
- Navigator: Nami 🧭  
- Sniper: Usopp 🎯  
- Chef: Sanji 🍳  
- Doctor: Chopper 🐾  
- Archaeologist: Nico Robin 📚  
- Shipwright: Franky 🔧  
- Musician: Brook 🎶  
- Helmsman: Jinbe 🐟  

---

## 📸 Demo (Optional)  
Add images or GIFs of your bot here when you test it.  

---

⚡ Built with ❤️ by **Strawhat Crew**
