import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

// Same visual pattern as the banner toggle on the Manage Events screen.
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled, label, activeLabel, inactiveLabel }) => (
  <div className="flex items-center gap-3">
    {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
    {(activeLabel || inactiveLabel) && (
      <span className={`text-sm font-medium ${checked ? 'text-green-600' : 'text-slate-400'}`}>
        {checked ? activeLabel : inactiveLabel}
      </span>
    )}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default ToggleSwitch;
