import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { StatusPanel } from './components/StatusPanel';
import { bluetoothService, type SensorData } from './services/bluetoothService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [sensorData, setSensorData] = useState<SensorData>({
    fireDetected: false,
    pumpStatus: false,
  });

  // Simulate sensor data when not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setSensorData({
          fireDetected: Math.random() > 0.8,
          pumpStatus: false,
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Set up sensor data callback
  useEffect(() => {
    bluetoothService.onSensorData((data: SensorData) => {
      setSensorData(data);
    });
  }, []);

  const handleConnect = async () => {
    try {
      await bluetoothService.connect();
      setIsConnected(true);
      setDeviceName(bluetoothService.getDeviceName());
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to FireBot. Make sure Bluetooth is enabled and the robot is nearby.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setIsConnected(false);
      setDeviceName('');
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const handleCommand = async (command: string) => {
    if (!isConnected) {
      alert('Please connect to the robot first!');
      return;
    }

    try {
      await bluetoothService.sendCommand(command);
      
      // Update pump status locally for immediate feedback
      if (command === 'P1') {
        setSensorData(prev => ({ ...prev, pumpStatus: true }));
      } else if (command === 'P0') {
        setSensorData(prev => ({ ...prev, pumpStatus: false }));
      }
    } catch (error) {
      console.error('Command error:', error);
      alert('Failed to send command to robot.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        isConnected={isConnected}
        deviceName={deviceName}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ControlPanel
            onCommand={handleCommand}
            pumpStatus={sensorData.pumpStatus}
            disabled={!isConnected}
          />
          <StatusPanel sensorData={sensorData} isConnected={isConnected} />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">1.</span>
              <span>
                Click <strong>"Connect to Robot"</strong> in the header to pair with your ESP32
                FireBot via Bluetooth.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">2.</span>
              <span>
                Use the <strong>arrow buttons</strong> to control movement (Forward, Backward,
                Left, Right).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">3.</span>
              <span>
                Press the <strong>Stop button</strong> (red square) to halt all movement.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">4.</span>
              <span>
                Toggle the <strong>Pump Control</strong> to activate/deactivate the water pump.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600">5.</span>
              <span>
                Monitor the <strong>Status Panel</strong> for real-time fire detection, obstacle
                distance, and pump status.
              </span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> This app uses the Web Bluetooth API, which requires
              HTTPS or localhost. Make sure your browser supports Web Bluetooth (Chrome, Edge, or
              Opera recommended).
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-gray-600">
        <p>FireBot Controller v1.0 | Built with React + Web Bluetooth API</p>
      </footer>
    </div>
  );
}

export default App;
