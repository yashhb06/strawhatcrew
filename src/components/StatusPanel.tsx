import React from 'react';
import { Flame, Droplet, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SensorData } from '../services/bluetoothService';

interface StatusPanelProps {
  sensorData: SensorData;
  isConnected: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ sensorData, isConnected }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Status Panel</h2>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-800">Connected</p>
                <p className="text-sm text-gray-600">Robot is online and ready</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-800">Not Connected</p>
                <p className="text-sm text-gray-600">Click "Connect to Robot" to start</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sensor Data */}
      <div className="space-y-4">
        {/* Fire Detection */}
        <div
          className={`p-4 rounded-lg border-2 ${
            sensorData.fireDetected
              ? 'bg-red-50 border-red-500'
              : 'bg-green-50 border-green-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame
                className={`w-8 h-8 ${
                  sensorData.fireDetected ? 'text-red-500' : 'text-green-500'
                }`}
              />
              <div>
                <p className="font-bold text-gray-800">Fire Detection</p>
                <p className="text-sm text-gray-600">
                  {sensorData.fireDetected ? '🔥 Fire Detected!' : '✅ Safe'}
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                sensorData.fireDetected
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {sensorData.fireDetected ? 'ALERT' : 'CLEAR'}
            </div>
          </div>
        </div>

        {/* Pump Status */}
        <div
          className={`p-4 rounded-lg border-2 ${
            sensorData.pumpStatus
              ? 'bg-green-50 border-green-500'
              : 'bg-gray-50 border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplet
                className={`w-8 h-8 ${
                  sensorData.pumpStatus ? 'text-green-500' : 'text-gray-400'
                }`}
              />
              <div>
                <p className="font-bold text-gray-800">Water Pump</p>
                <p className="text-sm text-gray-600">
                  {sensorData.pumpStatus ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                sensorData.pumpStatus
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {sensorData.pumpStatus ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Sensor data will update in real-time once connected to the
            robot. Currently showing simulated data.
          </p>
        </div>
      )}
    </div>
  );
};
