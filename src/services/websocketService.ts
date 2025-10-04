export interface SensorData {
  fire: boolean;
  pump: boolean;
}

export type Command = 'F' | 'B' | 'L' | 'R' | 'S' | 'P1' | 'P0';

class WebSocketService {
  private ws: WebSocket | null = null;
  private esp32Ip: string = '192.168.4.1'; // Default ESP32 AP IP, change as needed
  private port: string = '81';
  private onSensorDataCallback: ((data: SensorData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private reconnectInterval: number | null = null;

  setEsp32Ip(ip: string, port: string = '81'): void {
    this.esp32Ip = ip;
    this.port = port;
  }

  connect(): void {
    try {
      const wsUrl = `ws://${this.esp32Ip}:${this.port}`;
      console.log(`Connecting to ${wsUrl}...`);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to ESP32 FireBot');
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }
        // Clear any reconnection attempts
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: SensorData = JSON.parse(event.data);
          console.log('Received sensor data:', data);
          if (this.onSensorDataCallback) {
            this.onSensorDataCallback(data);
          }
        } catch (error) {
          console.error('Failed to parse sensor data:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('❌ Disconnected from ESP32');
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
        this.ws = null;
      };
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  sendCommand(command: Command): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      throw new Error('Not connected to ESP32');
    }

    try {
      this.ws.send(command);
      console.log(`Command sent: ${command}`);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  // Alternative: Send command via HTTP REST API
  async sendCommandHTTP(command: Command): Promise<void> {
    try {
      const response = await fetch(`http://${this.esp32Ip}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmd: command }),
      });

      if (!response.ok) {
        throw new Error('HTTP request failed');
      }

      console.log(`HTTP Command sent: ${command}`);
    } catch (error) {
      console.error('Failed to send HTTP command:', error);
      throw error;
    }
  }

  onSensorData(callback: (data: SensorData) => void): void {
    this.onSensorDataCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getEsp32Ip(): string {
    return this.esp32Ip;
  }
}

export const websocketService = new WebSocketService();
