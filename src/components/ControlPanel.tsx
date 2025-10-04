import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Droplet } from 'lucide-react';
import { COMMANDS } from '../constants/bluetooth';

interface ControlPanelProps {
  onCommand: (command: string) => void;
  pumpStatus: boolean;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onCommand,
  pumpStatus,
  disabled,
}) => {
  const buttonClass = `
    flex items-center justify-center p-6 rounded-xl font-bold text-white
    transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    shadow-lg hover:shadow-xl
  `;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Movement Controls</h2>

      {/* Movement Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Row 1 */}
        <div></div>
        <button
          onClick={() => onCommand(COMMANDS.FORWARD)}
          disabled={disabled}
          className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          title="Forward"
        >
          <ArrowUp className="w-8 h-8" />
        </button>
        <div></div>

        {/* Row 2 */}
        <button
          onClick={() => onCommand(COMMANDS.LEFT)}
          disabled={disabled}
          className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          title="Left"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
        <button
          onClick={() => onCommand(COMMANDS.STOP)}
          disabled={disabled}
          className={`${buttonClass} bg-red-500 hover:bg-red-600`}
          title="Stop"
        >
          <Square className="w-8 h-8" />
        </button>
        <button
          onClick={() => onCommand(COMMANDS.RIGHT)}
          disabled={disabled}
          className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          title="Right"
        >
          <ArrowRight className="w-8 h-8" />
        </button>

        {/* Row 3 */}
        <div></div>
        <button
          onClick={() => onCommand(COMMANDS.BACKWARD)}
          disabled={disabled}
          className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          title="Backward"
        >
          <ArrowDown className="w-8 h-8" />
        </button>
        <div></div>
      </div>

      {/* Pump Control */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pump Control</h3>
        <button
          onClick={() => onCommand(pumpStatus ? COMMANDS.PUMP_OFF : COMMANDS.PUMP_ON)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-white
            transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl
            ${pumpStatus ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}
          `}
        >
          <Droplet className="w-6 h-6" />
          <span>{pumpStatus ? 'Turn Pump OFF' : 'Turn Pump ON'}</span>
        </button>
      </div>

      {/* Command Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 font-medium mb-2">Command Reference:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>↑ Forward (F)</div>
          <div>↓ Backward (B)</div>
          <div>← Left (L)</div>
          <div>→ Right (R)</div>
          <div>⏹ Stop (S)</div>
          <div>💧 Pump (P1/P0)</div>
        </div>
      </div>
    </div>
  );
};
