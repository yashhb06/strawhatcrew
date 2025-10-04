/**
 * FireBot Local Bluetooth Bridge Server (Node.js)
 * =================================================
 * 
 * This Node.js Express server acts as a bridge between:
 * - React Web App (via HTTP/WebSocket on localhost:5000)
 * - ESP32 FireBot (via Bluetooth Serial)
 * 
 * Communication Flow:
 * React App → HTTP/WebSocket → Node Server → Bluetooth → ESP32 → I²C → Arduino Uno
 * 
 * Requirements:
 * - Node.js 16+
 * - Express
 * - Socket.IO
 * - serialport (for Bluetooth Serial communication)
 * 
 * Install dependencies:
 *     npm install express socket.io cors serialport
 * 
 * Usage:
 *     node bluetooth_bridge.js
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// Configuration
// ========================================
const PORT = 5000;
const BLUETOOTH_PORT = 'COM3'; // ⚠️ CHANGE THIS to your ESP32 COM port (check Device Manager)
const BAUD_RATE = 115200;

let serialPort = null;
let parser = null;
let isConnected = false;
let sensorData = {
  fireDetected: false,
  pumpStatus: false,
  connected: false
};

// ========================================
// Bluetooth Serial Functions
// ========================================

/**
 * Connect to ESP32 via Bluetooth Serial
 */
function connectBluetooth() {
  return new Promise((resolve, reject) => {
    try {
      console.log(`📡 Connecting to ESP32 on ${BLUETOOTH_PORT}...`);
      
      serialPort = new SerialPort({
        path: BLUETOOTH_PORT,
        baudRate: BAUD_RATE
      });

      parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

      serialPort.on('open', () => {
        isConnected = true;
        sensorData.connected = true;
        console.log('✅ Connected to ESP32 FireBot');
        
        // Emit connection status to all WebSocket clients
        io.emit('connection_status', { connected: true });
        
        resolve(true);
      });

      serialPort.on('error', (err) => {
        console.error('❌ Serial port error:', err.message);
        isConnected = false;
        sensorData.connected = false;
        reject(err);
      });

      serialPort.on('close', () => {
        console.log('🔌 Disconnected from ESP32');
        isConnected = false;
        sensorData.connected = false;
        io.emit('connection_status', { connected: false });
      });

      // Listen for sensor data
      parser.on('data', (data) => {
        handleSensorData(data);
      });

    } catch (error) {
      console.error('❌ Bluetooth connection failed:', error);
      reject(error);
    }
  });
}

/**
 * Disconnect from ESP32
 */
function disconnectBluetooth() {
  return new Promise((resolve) => {
    if (serialPort && serialPort.isOpen) {
      serialPort.close((err) => {
        if (err) {
          console.error('Error closing port:', err);
        }
        isConnected = false;
        sensorData.connected = false;
        io.emit('connection_status', { connected: false });
        resolve();
      });
    } else {
      isConnected = false;
      sensorData.connected = false;
      resolve();
    }
  });
}

/**
 * Send command to ESP32
 */
function sendCommand(command) {
  return new Promise((resolve, reject) => {
    if (!isConnected || !serialPort || !serialPort.isOpen) {
      reject(new Error('Not connected to ESP32'));
      return;
    }

    serialPort.write(command + '\n', (err) => {
      if (err) {
        console.error('❌ Failed to send command:', err);
        reject(err);
      } else {
        console.log(`📤 Sent command: ${command}`);
        resolve(true);
      }
    });
  });
}

/**
 * Handle incoming sensor data from ESP32
 */
function handleSensorData(data) {
  try {
    // Parse sensor data (format: "FIRE:0,DIST:0,PUMP:1")
    const parts = data.trim().split(',');
    
    parts.forEach(part => {
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        
        if (key === 'FIRE') {
          sensorData.fireDetected = (value === '1');
        } else if (key === 'PUMP') {
          sensorData.pumpStatus = (value === '1');
        }
      }
    });

    // Emit sensor data to all WebSocket clients
    io.emit('sensor_data', sensorData);
    console.log('📊 Sensor data:', sensorData);

  } catch (error) {
    console.error('Error parsing sensor data:', error);
  }
}

// ========================================
// REST API Endpoints
// ========================================

/**
 * POST /api/connect - Connect to ESP32 Bluetooth
 */
app.post('/api/connect', async (req, res) => {
  try {
    await connectBluetooth();
    res.json({
      success: true,
      connected: true,
      message: 'Connected to FireBot'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      connected: false,
      message: 'Connection failed: ' + error.message
    });
  }
});

/**
 * POST /api/disconnect - Disconnect from ESP32
 */
app.post('/api/disconnect', async (req, res) => {
  try {
    await disconnectBluetooth();
    res.json({
      success: true,
      connected: false,
      message: 'Disconnected from FireBot'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Disconnect failed: ' + error.message
    });
  }
});

/**
 * POST /api/send-command - Send command to ESP32
 */
app.post('/api/send-command', async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({
      success: false,
      message: 'No command provided'
    });
  }

  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Not connected to FireBot'
    });
  }

  try {
    await sendCommand(command);
    res.json({
      success: true,
      message: `Command ${command} sent`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send command: ' + error.message
    });
  }
});

/**
 * GET /api/status - Get current robot status
 */
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    sensorData: sensorData
  });
});

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    server: 'FireBot Bluetooth Bridge',
    version: '1.0.0'
  });
});

// ========================================
// WebSocket Events
// ========================================

io.on('connection', (socket) => {
  console.log('🔌 WebSocket client connected:', socket.id);

  // Send current status to new client
  socket.emit('connection_status', { connected: isConnected });
  socket.emit('sensor_data', sensorData);

  // Handle command via WebSocket
  socket.on('send_command', async (data) => {
    try {
      await sendCommand(data.command);
      socket.emit('command_response', { success: true, command: data.command });
    } catch (error) {
      socket.emit('command_response', { success: false, command: data.command, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 WebSocket client disconnected:', socket.id);
  });
});

// ========================================
// Server Startup
// ========================================

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🔥 FireBot Local Bluetooth Bridge Server (Node.js)');
  console.log('='.repeat(50));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`WebSocket available on: ws://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log('  POST /api/connect       - Connect to ESP32');
  console.log('  POST /api/disconnect    - Disconnect from ESP32');
  console.log('  POST /api/send-command  - Send command to robot');
  console.log('  GET  /api/status        - Get robot status');
  console.log('  GET  /api/health        - Server health check');
  console.log('\nPress Ctrl+C to stop');
  console.log('='.repeat(50) + '\n');
  console.log('⚠️  IMPORTANT: Update BLUETOOTH_PORT in this file to match your ESP32 COM port');
  console.log('   Current: ' + BLUETOOTH_PORT);
  console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server...');
  await disconnectBluetooth();
  process.exit(0);
});
