import {
  SERVICE_UUID,
  MOVEMENT_CHAR_UUID,
  PUMP_CHAR_UUID,
  SENSOR_CHAR_UUID,
  DEVICE_NAME_PREFIX,
  type Command,
} from '../constants/bluetooth';

export interface SensorData {
  fireDetected: boolean;
  pumpStatus: boolean;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private movementCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private pumpCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private sensorCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onSensorDataCallback: ((data: SensorData) => void) | null = null;

  async connect(): Promise<void> {
    try {
      // Check if Web Bluetooth is available
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not available in this browser');
      }

      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: DEVICE_NAME_PREFIX }],
        optionalServices: [SERVICE_UUID],
      });

      if (!this.device.gatt) {
        throw new Error('GATT not available');
      }

      // Connect to GATT server
      this.server = await this.device.gatt.connect();

      // Get service
      const service = await this.server.getPrimaryService(SERVICE_UUID);

      // Get characteristics
      this.movementCharacteristic = await service.getCharacteristic(MOVEMENT_CHAR_UUID);
      this.pumpCharacteristic = await service.getCharacteristic(PUMP_CHAR_UUID);
      this.sensorCharacteristic = await service.getCharacteristic(SENSOR_CHAR_UUID);

      // Start notifications for sensor data
      await this.sensorCharacteristic.startNotifications();
      this.sensorCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleSensorData.bind(this)
      );

      // Handle disconnection
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      console.log('✅ Connected to FireBot successfully');
    } catch (error: any) {
      // Don't log error if user cancelled the pairing dialog
      if (error.name === 'NotFoundError' || error.message?.includes('User cancelled')) {
        console.log('Bluetooth pairing cancelled by user');
      } else {
        console.error('❌ Bluetooth connection failed:', error.message || error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.device = null;
    this.server = null;
    this.movementCharacteristic = null;
    this.pumpCharacteristic = null;
    this.sensorCharacteristic = null;
  }

  async sendCommand(command: Command): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      // Determine which characteristic to use
      if (command === 'P1' || command === 'P0' || command === 'EXTINGUISH') {
        if (!this.pumpCharacteristic) {
          throw new Error('Pump characteristic not available');
        }
        await this.pumpCharacteristic.writeValue(data);
      } else {
        if (!this.movementCharacteristic) {
          throw new Error('Movement characteristic not available');
        }
        await this.movementCharacteristic.writeValue(data);
      }

      console.log(`Command sent: ${command}`);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  private handleSensorData(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) return;

    const decoder = new TextDecoder();
    const dataString = decoder.decode(value);

    try {
      // Expected format: "FIRE:0,DIST:0,PUMP:1"
      const parts = dataString.split(',');
      const sensorData: SensorData = {
        fireDetected: parts[0]?.split(':')[1] === '1',
        pumpStatus: parts[2]?.split(':')[1] === '1',
      };

      if (this.onSensorDataCallback) {
        this.onSensorDataCallback(sensorData);
      }
    } catch (error) {
      console.error('Failed to parse sensor data:', error);
    }
  }

  private handleDisconnect(): void {
    console.log('Disconnected from FireBot');
    this.device = null;
    this.server = null;
    this.movementCharacteristic = null;
    this.pumpCharacteristic = null;
    this.sensorCharacteristic = null;
  }

  onSensorData(callback: (data: SensorData) => void): void {
    this.onSensorDataCallback = callback;
  }

  isConnected(): boolean {
    return this.server?.connected || false;
  }

  getDeviceName(): string {
    return this.device?.name || 'Unknown';
  }
}

export const bluetoothService = new BluetoothService();
