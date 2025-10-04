"""
FireBot Local Bluetooth Bridge Server
======================================

This Python Flask server acts as a bridge between:
- React Web App (via HTTP/WebSocket on localhost:5000)
- ESP32 FireBot (via Bluetooth Classic)

Communication Flow:
React App → HTTP/WebSocket → Python Server → Bluetooth → ESP32 → I²C → Arduino Uno

Requirements:
- Python 3.8+
- Flask
- Flask-CORS
- Flask-SocketIO
- PyBluez (for Bluetooth communication)

Install dependencies:
    pip install flask flask-cors flask-socketio pybluez

Usage:
    python bluetooth_bridge.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import bluetooth
import threading
import time
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React app
socketio = SocketIO(app, cors_allowed_origins="*")

# ========================================
# Configuration
# ========================================
ESP32_NAME = "FireBot"  # Bluetooth device name
ESP32_ADDRESS = None    # Will be discovered
bt_socket = None
is_connected = False
sensor_data = {
    "fireDetected": False,
    "pumpStatus": False,
    "connected": False
}

# ========================================
# Bluetooth Functions
# ========================================

def discover_esp32():
    """Discover ESP32 Bluetooth device"""
    global ESP32_ADDRESS
    
    print("🔍 Searching for ESP32 FireBot...")
    nearby_devices = bluetooth.discover_devices(duration=8, lookup_names=True)
    
    for addr, name in nearby_devices:
        if ESP32_NAME in name:
            ESP32_ADDRESS = addr
            print(f"✅ Found {name} at {addr}")
            return True
    
    print(f"❌ {ESP32_NAME} not found")
    return False

def connect_bluetooth():
    """Connect to ESP32 via Bluetooth Classic"""
    global bt_socket, is_connected, ESP32_ADDRESS
    
    try:
        if ESP32_ADDRESS is None:
            if not discover_esp32():
                return False
        
        print(f"📡 Connecting to {ESP32_ADDRESS}...")
        bt_socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
        bt_socket.connect((ESP32_ADDRESS, 1))  # Port 1 for RFCOMM
        is_connected = True
        sensor_data["connected"] = True
        
        print("✅ Connected to ESP32 FireBot")
        
        # Start sensor data listener thread
        listener_thread = threading.Thread(target=sensor_listener, daemon=True)
        listener_thread.start()
        
        # Emit connection status via WebSocket
        socketio.emit('connection_status', {'connected': True})
        
        return True
        
    except Exception as e:
        print(f"❌ Bluetooth connection failed: {e}")
        is_connected = False
        sensor_data["connected"] = False
        return False

def disconnect_bluetooth():
    """Disconnect from ESP32"""
    global bt_socket, is_connected
    
    if bt_socket:
        try:
            bt_socket.close()
            print("🔌 Disconnected from ESP32")
        except:
            pass
    
    bt_socket = None
    is_connected = False
    sensor_data["connected"] = False
    socketio.emit('connection_status', {'connected': False})

def send_command(command):
    """Send command to ESP32 via Bluetooth"""
    global bt_socket, is_connected
    
    if not is_connected or bt_socket is None:
        return False
    
    try:
        # Send command as string
        bt_socket.send(command.encode('utf-8'))
        print(f"📤 Sent command: {command}")
        return True
    except Exception as e:
        print(f"❌ Failed to send command: {e}")
        is_connected = False
        sensor_data["connected"] = False
        return False

def sensor_listener():
    """Listen for sensor data from ESP32"""
    global bt_socket, is_connected, sensor_data
    
    while is_connected and bt_socket:
        try:
            # Receive data from ESP32
            data = bt_socket.recv(1024).decode('utf-8')
            
            if data:
                # Parse sensor data (format: "FIRE:0,DIST:0,PUMP:1")
                parts = data.strip().split(',')
                for part in parts:
                    if ':' in part:
                        key, value = part.split(':')
                        if key == 'FIRE':
                            sensor_data["fireDetected"] = (value == '1')
                        elif key == 'PUMP':
                            sensor_data["pumpStatus"] = (value == '1')
                
                # Emit sensor data via WebSocket
                socketio.emit('sensor_data', sensor_data)
                print(f"📊 Sensor data: {sensor_data}")
                
        except Exception as e:
            if is_connected:
                print(f"❌ Sensor listener error: {e}")
                is_connected = False
                sensor_data["connected"] = False
                socketio.emit('connection_status', {'connected': False})
            break
        
        time.sleep(0.1)  # Small delay

# ========================================
# REST API Endpoints
# ========================================

@app.route('/api/connect', methods=['POST'])
def api_connect():
    """Connect to ESP32 Bluetooth"""
    success = connect_bluetooth()
    return jsonify({
        'success': success,
        'connected': is_connected,
        'message': 'Connected to FireBot' if success else 'Connection failed'
    })

@app.route('/api/disconnect', methods=['POST'])
def api_disconnect():
    """Disconnect from ESP32"""
    disconnect_bluetooth()
    return jsonify({
        'success': True,
        'connected': False,
        'message': 'Disconnected from FireBot'
    })

@app.route('/api/send-command', methods=['POST'])
def api_send_command():
    """Send command to ESP32"""
    data = request.get_json()
    command = data.get('command', '')
    
    if not command:
        return jsonify({'success': False, 'message': 'No command provided'}), 400
    
    if not is_connected:
        return jsonify({'success': False, 'message': 'Not connected to FireBot'}), 503
    
    success = send_command(command)
    
    return jsonify({
        'success': success,
        'message': f'Command {command} sent' if success else 'Failed to send command'
    })

@app.route('/api/status', methods=['GET'])
def api_status():
    """Get current robot status"""
    return jsonify({
        'connected': is_connected,
        'sensorData': sensor_data
    })

@app.route('/api/health', methods=['GET'])
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'server': 'FireBot Bluetooth Bridge',
        'version': '1.0.0'
    })

# ========================================
# WebSocket Events
# ========================================

@socketio.on('connect')
def handle_ws_connect():
    """WebSocket connection established"""
    print("🔌 WebSocket client connected")
    emit('connection_status', {'connected': is_connected})
    emit('sensor_data', sensor_data)

@socketio.on('disconnect')
def handle_ws_disconnect():
    """WebSocket client disconnected"""
    print("🔌 WebSocket client disconnected")

@socketio.on('send_command')
def handle_ws_command(data):
    """Handle command via WebSocket"""
    command = data.get('command', '')
    success = send_command(command)
    emit('command_response', {'success': success, 'command': command})

# ========================================
# Main
# ========================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🔥 FireBot Local Bluetooth Bridge Server")
    print("="*50)
    print("Server running on: http://localhost:5000")
    print("WebSocket available on: ws://localhost:5000")
    print("\nEndpoints:")
    print("  POST /api/connect       - Connect to ESP32")
    print("  POST /api/disconnect    - Disconnect from ESP32")
    print("  POST /api/send-command  - Send command to robot")
    print("  GET  /api/status        - Get robot status")
    print("  GET  /api/health        - Server health check")
    print("\nPress Ctrl+C to stop")
    print("="*50 + "\n")
    
    # Run Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)
