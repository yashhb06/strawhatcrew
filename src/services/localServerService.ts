/**
 * Local Server Service for FireBot
 * ==================================
 * 
 * This service replaces the Web Bluetooth API with communication to a local server.
 * 
 * Communication Flow:
 * React App → HTTP/WebSocket → Local Server (localhost:5000) → Bluetooth → ESP32 → I²C → Arduino Uno
 * 
 * The local server acts as a bridge between the React app and the ESP32 Bluetooth connection.
 * This approach works on all browsers (not just Chrome/Edge) and doesn't require HTTPS.
 */

import io, { Socket } from 'socket.io-client';

export interface SensorData {
  fireDetected: boolean;
  pumpStatus: boolean;
}

export type Command = 'F' | 'B' | 'L' | 'R' | 'S' | 'P1' | 'P0' | 'EXTINGUISH';

class LocalServerService {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:5000';
  private onSensorDataCallback: ((data: SensorData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private connected: boolean = false;

  /**
   * Initialize WebSocket connection to local server
   */
  private initializeWebSocket(): void {
    if (this.socket) {
      return; // Already initialized
    }

    console.log('🔌 Connecting to local server...');
    
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // WebSocket connected to server
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected to local server');
    });

    // WebSocket disconnected from server
    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected from local server');
      this.connected = false;
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
      }
    });

    // Connection status updates from ESP32
    this.socket.on('connection_status', (data: { connected: boolean }) => {
      console.log('📡 ESP32 connection status:', data.connected);
      this.connected = data.connected;
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(data.connected);
      }
    });

    // Sensor data updates from ESP32
    this.socket.on('sensor_data', (data: any) => {
      const sensorData: SensorData = {
        fireDetected: data.fireDetected || false,
        pumpStatus: data.pumpStatus || false
      };
      
      if (this.onSensorDataCallback) {
        this.onSensorDataCallback(sensorData);
      }
    });

    // Command response
    this.socket.on('command_response', (data: any) => {
      if (data.success) {
        console.log(`✅ Command ${data.command} executed successfully`);
      } else {
        console.error(`❌ Command ${data.command} failed:`, data.error);
      }
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  /**
   * Connect to ESP32 via local server
   */
  async connect(): Promise<void> {
    try {
      // Initialize WebSocket first
      this.initializeWebSocket();

      // Call REST API to connect to ESP32 Bluetooth
      const response = await fetch(`${this.serverUrl}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect to local server');
      }

      const data = await response.json();

      if (data.success) {
        this.connected = true;
        console.log('✅ Connected to ESP32 FireBot via local server');
        
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }
      } else {
        throw new Error(data.message || 'Connection failed');
      }

    } catch (error: any) {
      console.error('❌ Connection failed:', error.message);
      
      // Check if local server is running
      if (error.message.includes('fetch')) {
        throw new Error('Local server not running. Please start the server first (python bluetooth_bridge.py or node bluetooth_bridge.js)');
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from ESP32
   */
  async disconnect(): Promise<void> {
    try {
      const response = await fetch(`${this.serverUrl}/api/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        this.connected = false;
        console.log('🔌 Disconnected from ESP32 FireBot');
        
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
      }

    } catch (error) {
      console.error('❌ Disconnect failed:', error);
    }
  }

  /**
   * Send command to ESP32 via local server
   */
  async sendCommand(command: Command | string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to FireBot');
    }

    try {
      // Send via REST API
      const response = await fetch(`${this.serverUrl}/api/send-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error('Failed to send command');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Command failed');
      }

      console.log(`📤 Command sent: ${command}`);

      // Also send via WebSocket for real-time response
      if (this.socket && this.socket.connected) {
        this.socket.emit('send_command', { command });
      }

    } catch (error: any) {
      console.error('❌ Failed to send command:', error.message);
      throw error;
    }
  }

  /**
   * Get current robot status
   */
  async getStatus(): Promise<{ connected: boolean; sensorData: SensorData }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      
      if (!response.ok) {
        throw new Error('Failed to get status');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Failed to get status:', error);
      return {
        connected: false,
        sensorData: {
          fireDetected: false,
          pumpStatus: false
        }
      };
    }
  }

  /**
   * Check if local server is running
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/health`, {
        method: 'GET'
      });

      return response.ok;

    } catch (error) {
      return false;
    }
  }

  /**
   * Register callback for sensor data updates
   */
  onSensorData(callback: (data: SensorData) => void): void {
    this.onSensorDataCallback = callback;
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Check if connected to ESP32
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get device name (for compatibility)
   */
  getDeviceName(): string {
    return 'FireBot';
  }

  /**
   * Cleanup and disconnect
   */
  cleanup(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }
}

// Export singleton instance
export const localServerService = new LocalServerService();
