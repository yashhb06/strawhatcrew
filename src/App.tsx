import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { StatusPanel } from './components/StatusPanel';
import { localServerService, type SensorData } from './services/localServerService';

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
    localServerService.onSensorData((data: SensorData) => {
      setSensorData(data);
    });
    
    localServerService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
    });
  }, []);

  const handleConnect = async () => {
    try {
      await localServerService.connect();
      setIsConnected(true);
      setDeviceName(localServerService.getDeviceName());
    } catch (error: any) {
      // Only show error if user actually attempted to connect (not if they cancelled)
      if (error?.message && !error.message.includes('User cancelled')) {
        console.error('Connection error:', error);
        alert('Failed to connect to FireBot. Make sure Bluetooth is enabled and the robot is nearby.');
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await localServerService.disconnect();
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
      await localServerService.sendCommand(command);
      
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
    <div className="min-h-screen bg-slate-950">
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

        {/* Connection Message */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Connect to your FireBot to enable controls. Sensor data is simulated when not connected.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
