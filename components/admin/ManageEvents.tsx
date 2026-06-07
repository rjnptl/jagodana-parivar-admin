import React from 'react';
import { GetTogetherConfig } from '../../types';
import { Calendar, MapPin, Clock, Save, Megaphone } from 'lucide-react';

interface ManageEventsProps {
  config: GetTogetherConfig;
  setConfig: React.Dispatch<React.SetStateAction<GetTogetherConfig>>;
}

const ManageEvents: React.FC<ManageEventsProps> = ({ config, setConfig }) => {
  
  const handleChange = (field: keyof GetTogetherConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Events</h2>
          <p className="text-slate-500">Configure the next family get-together details.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
               <Megaphone size={24} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-800">Next Get-Together Banner</h3>
               <p className="text-sm text-slate-500">This banner appears on the User Home Page</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <span className={`text-sm font-medium ${config.isEnabled ? 'text-green-600' : 'text-slate-400'}`}>
               {config.isEnabled ? 'Banner Active' : 'Banner Hidden'}
             </span>
             <button 
               onClick={() => handleChange('isEnabled', !config.isEnabled)}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                 config.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
               }`}
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                 config.isEnabled ? 'translate-x-6' : 'translate-x-1'
               }`} />
             </button>
           </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Edit Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700 mb-2">Event Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Village Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={config.villageName}
                  onChange={(e) => handleChange('villageName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. લખતર"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="date" 
                  value={config.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={config.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 09:00 AM"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-center">
            <h4 className="font-semibold text-slate-400 mb-4 text-xs uppercase tracking-wider text-center">Live Preview</h4>
            
            <div className={`rounded-xl p-6 text-white shadow-lg transition-all ${config.isEnabled ? 'opacity-100 scale-100' : 'opacity-50 scale-95 grayscale'}`} style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)' }}>
               <div className="flex flex-col items-center text-center space-y-3">
                 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
                   Next Family Gathering
                 </div>
                 
                 <h2 className="text-2xl font-bold">{config.villageName || 'Village Name'}</h2>
                 
                 <div className="flex flex-wrap justify-center gap-3 text-sm font-medium mt-2">
                   <div className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg">
                     <Calendar size={16} className="mr-1.5" />
                     {config.date || 'YYYY-MM-DD'}
                   </div>
                   <div className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg">
                     <Clock size={16} className="mr-1.5" />
                     {config.time || 'HH:MM'}
                   </div>
                 </div>
               </div>
            </div>
            
            {!config.isEnabled && (
              <p className="text-center text-red-500 text-xs mt-3 font-medium">Banner is currently hidden from users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;