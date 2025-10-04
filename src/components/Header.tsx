import React from 'react';
import { Bluetooth, BluetoothConnected, Flame } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  deviceName: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  deviceName,
  onConnect,
  onDisconnect,
}) => {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8" />
            <h1 className="text-2xl font-bold">FireBot Controller</h1>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Connected to {deviceName}</span>
              </div>
            )}

            <button
              onClick={isConnected ? onDisconnect : onConnect}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isConnected
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white text-orange-600 hover:bg-gray-100'
              }`}
            >
              {isConnected ? (
                <>
                  <BluetoothConnected className="w-5 h-5" />
                  Disconnect
                </>
              ) : (
                <>
                  <Bluetooth className="w-5 h-5" />
                  Connect to Robot
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
