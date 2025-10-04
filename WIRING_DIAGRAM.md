# 🔌 FireBot Complete Wiring Diagram

Visual guide for connecting ESP32, Arduino Uno, and all peripherals.

## 📐 Complete System Wiring

```
                                    FIREBOT WIRING DIAGRAM
                                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                              POWER SUPPLY                                    │
│  ┌──────────┐        ┌──────────┐         ┌──────────┐                     │
│  │ 12V PSU  │        │  5V USB  │         │  5V USB  │                     │
│  │ (Motors) │        │ (ESP32)  │         │ (Arduino)│                     │
│  └────┬─────┘        └────┬─────┘         └────┬─────┘                     │
└───────┼──────────────────┼─────────────────────┼───────────────────────────┘
        │                  │                     │
        │                  │                     │
        ▼                  ▼                     ▼
┌───────────────┐  ┌──────────────┐    ┌─────────────────┐
│   L298N       │  │    ESP32     │    │   ARDUINO UNO   │
│ Motor Driver  │  │  Dev Board   │    │                 │
└───────────────┘  └──────────────┘    └─────────────────┘
```

---

## 🔗 I²C Connection (Critical!)

```
        ESP32                    Arduino Uno
    ┌──────────┐              ┌──────────────┐
    │          │              │              │
    │  GPIO 21 ├──────────────┤ A4 (SDA)     │
    │   (SDA)  │   I²C Data   │              │
    │          │              │              │
    │  GPIO 22 ├──────────────┤ A5 (SCL)     │
    │   (SCL)  │   I²C Clock  │              │
    │          │              │              │
    │   GND    ├──────────────┤ GND          │
    │          │  Common GND  │              │
    └──────────┘              └──────────────┘
```

**⚠️ CRITICAL NOTES:**
- **Common Ground is MANDATORY** - Without it, I²C will not work!
- Use short wires (< 30cm) for reliable I²C communication
- Do NOT cross SDA and SCL wires
- Both devices must be powered before I²C communication

---

## 🚗 Motor Connections

### Arduino Uno to L298N Motor Driver

```
Arduino Uno          L298N Motor Driver
┌──────────┐         ┌─────────────────┐
│          │         │                 │
│   D5     ├─────────┤ IN1 (Left+)     │
│   D6     ├─────────┤ IN2 (Left-)     │
│   D7     ├─────────┤ IN3 (Right+)    │
│   D8     ├─────────┤ IN4 (Right-)    │
│          │         │                 │
│   GND    ├─────────┤ GND             │
│          │         │                 │
└──────────┘         └─────────────────┘
                              │
                              │ Motor Outputs
                              ▼
                     ┌─────────────────┐
                     │  OUT1 ─── M1+   │ Left Motor
                     │  OUT2 ─── M1-   │
                     │                 │
                     │  OUT3 ─── M2+   │ Right Motor
                     │  OUT4 ─── M2-   │
                     └─────────────────┘

Power Supply (12V)
     │
     ├─────────────► 12V (L298N)
     └─────────────► GND (L298N)
```

**Motor Driver Settings:**
- Enable jumpers: ON (for full speed)
- If using PWM speed control, remove jumpers and connect to Arduino PWM pins

---

## 🔥 Fire Sensor Connections

```
Arduino Uno          Fire Sensors (x3)
┌──────────┐         
│          │         ┌─────────────────┐
│   D2     ├─────────┤ OUT (Left)      │
│          │         │ VCC ──► 5V      │
│          │         │ GND ──► GND     │
│          │         └─────────────────┘
│          │         
│   D3     ├─────────┤ OUT (Right)     │
│          │         │ VCC ──► 5V      │
│          │         │ GND ──► GND     │
│          │         └─────────────────┘
│          │         
│   D4     ├─────────┤ OUT (Forward)   │
│          │         │ VCC ──► 5V      │
│          │         │ GND ──► GND     │
│   5V     ├─────────┤ VCC (All)       │
│   GND    ├─────────┤ GND (All)       │
└──────────┘         └─────────────────┘
```

**Sensor Notes:**
- IR flame sensors output LOW when fire is detected
- Adjust sensitivity using onboard potentiometer
- Test detection range: typically 20-100cm
- LED on sensor indicates detection

---

## 💧 Water Pump Connection

```
Arduino Uno          Relay Module          Water Pump
┌──────────┐         ┌─────────────┐       ┌──────────┐
│          │         │             │       │          │
│   D9     ├─────────┤ IN          │       │          │
│          │         │             │       │          │
│   5V     ├─────────┤ VCC         │       │          │
│   GND    ├─────────┤ GND         │       │          │
│          │         │             │       │          │
│          │         │ COM  ───────┼───────┤ +12V     │
│          │         │ NO   ───────┼───────┤ Motor+   │
└──────────┘         └─────────────┘       │          │
                            │              │ Motor-   │
                            │              └────┬─────┘
                     12V PSU GND ────────────────┘
```

**Pump Wiring:**
- Use relay to switch high-current pump
- Relay type: 5V trigger, 10A capacity minimum
- Pump voltage: Match to your pump (typically 12V)
- Add flyback diode across pump for protection

---

## 🔄 Servo Motor Connection

```
Arduino Uno          Servo Motor
┌──────────┐         ┌─────────────┐
│          │         │             │
│   D10    ├─────────┤ Signal (Y)  │
│   5V     ├─────────┤ VCC (R)     │
│   GND    ├─────────┤ GND (B)     │
│          │         │             │
└──────────┘         └─────────────┘
```

**Servo Notes:**
- Standard servo: 0-180° rotation
- Used for fire scanning
- Color code: Yellow=Signal, Red=VCC, Brown=GND
- For high-torque servos, use external 5V supply

---

## 📊 Complete Pin Assignment Table

### ESP32 Pin Usage

| Pin | Function | Connected To |
|-----|----------|--------------|
| GPIO 21 | I²C SDA | Arduino A4 |
| GPIO 22 | I²C SCL | Arduino A5 |
| GND | Ground | Arduino GND |
| 5V | Power | USB (not used for Arduino) |

### Arduino Uno Pin Usage

| Pin | Function | Connected To |
|-----|----------|--------------|
| A4 (SDA) | I²C Data | ESP32 GPIO 21 |
| A5 (SCL) | I²C Clock | ESP32 GPIO 22 |
| D2 | Left Fire Sensor | Sensor OUT |
| D3 | Right Fire Sensor | Sensor OUT |
| D4 | Forward Fire Sensor | Sensor OUT |
| D5 | Motor Left 1 | L298N IN1 |
| D6 | Motor Left 2 | L298N IN2 |
| D7 | Motor Right 1 | L298N IN3 |
| D8 | Motor Right 2 | L298N IN4 |
| D9 | Pump Relay | Relay IN |
| D10 | Servo Signal | Servo Signal |
| 5V | Power Output | Sensors, Relay, Servo |
| GND | Ground | All components |

---

## 🔋 Power Distribution

```
                    POWER DISTRIBUTION DIAGRAM

12V Power Supply (2A minimum)
        │
        ├──────────────► L298N Motor Driver (12V input)
        │                    │
        │                    └──► Motors (via H-bridge)
        │
        └──────────────► Relay COM (for pump)
                             │
                             └──► Water Pump (when relay ON)

5V USB Power (ESP32)
        │
        └──────────────► ESP32 Dev Board

5V USB Power (Arduino)
        │
        └──────────────► Arduino Uno
                             │
                             ├──► Fire Sensors (3x)
                             ├──► Relay Module (trigger)
                             └──► Servo Motor

⚠️ IMPORTANT: All grounds must be connected together!
```

**Power Requirements:**
- **12V Supply**: 2A minimum (for motors and pump)
- **ESP32**: 500mA via USB
- **Arduino**: 500mA via USB
- **Total System**: ~3A at 12V + 1A at 5V

---

## 🛠️ Assembly Steps

### Step 1: Mount Components
1. Secure Arduino Uno to robot chassis
2. Mount ESP32 near Arduino (for short I²C wires)
3. Install L298N motor driver
4. Position relay module
5. Mount fire sensors (facing forward, left, right)

### Step 2: I²C Connection (Do This First!)
1. Connect ESP32 GPIO 21 → Arduino A4 (SDA)
2. Connect ESP32 GPIO 22 → Arduino A5 (SCL)
3. Connect ESP32 GND → Arduino GND
4. **Test I²C connection before proceeding**

### Step 3: Motor Wiring
1. Connect Arduino D5-D8 to L298N IN1-IN4
2. Connect motors to L298N OUT1-OUT4
3. Connect 12V power to L298N
4. Connect L298N GND to common ground

### Step 4: Sensor Wiring
1. Connect fire sensors to D2, D3, D4
2. Connect sensor VCC to Arduino 5V
3. Connect sensor GND to Arduino GND
4. Adjust sensor sensitivity

### Step 5: Pump & Servo
1. Connect relay IN to Arduino D9
2. Connect relay VCC/GND to Arduino 5V/GND
3. Wire pump through relay
4. Connect servo to D10
5. Connect servo power to Arduino 5V/GND

### Step 6: Power Up
1. Connect Arduino USB
2. Connect ESP32 USB
3. Connect 12V power supply
4. Verify all LEDs light up
5. Check Serial Monitors for proper initialization

---

## ✅ Testing Checklist

- [ ] I²C communication working (ESP32 detects Arduino)
- [ ] BLE connection successful (React app connects)
- [ ] Forward command moves both motors forward
- [ ] Backward command moves both motors backward
- [ ] Left command turns robot left
- [ ] Right command turns robot right
- [ ] Stop command halts all motors
- [ ] Pump activates on command
- [ ] Servo sweeps when scanning
- [ ] Fire sensors detect flame
- [ ] Status updates appear in React app

---

## 🔧 Wire Specifications

**Recommended Wire Gauges:**
- **I²C (SDA/SCL)**: 22-24 AWG, < 30cm length
- **Motor Power**: 18-20 AWG
- **Sensor Signals**: 22-24 AWG
- **Ground**: 18 AWG (thick for current capacity)

**Wire Colors (Suggested):**
- **Red**: +5V / +12V
- **Black**: GND
- **Yellow**: I²C SDA
- **Green**: I²C SCL
- **Blue**: Motor control signals
- **White**: Sensor signals

---

## 🚨 Safety Warnings

⚠️ **ELECTRICAL HAZARDS:**
- Never connect/disconnect wires while powered
- Check polarity before connecting power
- Use fuses on 12V supply (2A fast-blow)
- Insulate all exposed connections

⚠️ **SHORT CIRCUIT PREVENTION:**
- Double-check all connections before power-up
- Keep wires organized and secured
- Use heat shrink or electrical tape on connections
- Test with multimeter before applying power

---

## 📸 Visual Reference

**I²C Connection Close-up:**
```
ESP32 Side:          Arduino Side:
┌─────────┐          ┌─────────┐
│ 21 ●────┼──────────┼────● A4 │  (SDA - Data)
│ 22 ●────┼──────────┼────● A5 │  (SCL - Clock)
│ G  ●────┼──────────┼────● G  │  (Ground)
└─────────┘          └─────────┘
```

**Motor Driver Connections:**
```
L298N Top View:
┌─────────────────────┐
│  [12V] [GND] [5V]   │  Power Input
│                     │
│  IN1  IN2  IN3  IN4 │  Control Inputs
│   │    │    │    │  │
│   D5   D6   D7   D8 │  From Arduino
│                     │
│ OUT1 OUT2 OUT3 OUT4 │  Motor Outputs
│   │    │    │    │  │
│   └─M1─┘    └─M2─┘  │  Motors
└─────────────────────┘
```

---

**For detailed software setup, see `I2C_INTEGRATION_GUIDE.md`**
