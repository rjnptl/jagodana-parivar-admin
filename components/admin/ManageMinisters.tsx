
import React, { useState } from 'react';
import { Member, ZoneMinister, Village } from '../../types';
import { Trash2, UserPlus, Map, MapPin } from 'lucide-react';

interface ManageMinistersProps {
  ministers: ZoneMinister[];
  setMinisters: React.Dispatch<React.SetStateAction<ZoneMinister[]>>;
  members: Member[];
  villages: Village[];
}

const ManageMinisters: React.FC<ManageMinistersProps> = ({ ministers, setMinisters, members, villages }) => {
  const [newMinister, setNewMinister] = useState<Partial<ZoneMinister>>({});
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  const handleAdd = () => {
    if (!newMinister.memberId || !newMinister.zoneName || !newMinister.role) return;
    
    const minister: ZoneMinister = {
      id: `zm${Date.now()}`,
      memberId: newMinister.memberId,
      zoneName: newMinister.zoneName,
      role: newMinister.role,
      currentCity: newMinister.currentCity
    };
    
    setMinisters([...ministers, minister]);
    setNewMinister({});
    setSelectedVillageId(''); // Reset selection
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to remove this minister assignment?")) {
        setMinisters(ministers.filter(m => m.id !== id));
    }
  };

  // Filter members based on selected village (HOF only)
  const filteredMembers = selectedVillageId 
    ? members.filter(m => m.villageId === selectedVillageId && m.headOfHousehold)
    : [];

  // Handle "All" case if central committee logic is needed
  const availableMembers = selectedVillageId === 'All' 
    ? members.filter(m => m.headOfHousehold) 
    : filteredMembers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Zone Ministers</h2>
        <p className="text-slate-500">Assign responsibilities to members for specific village zones.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600"/> Assign New Minister</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* 1. Select Village First */}
            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Zone / Village</label>
               <select 
                 className="w-full p-2 border rounded bg-white"
                 value={selectedVillageId}
                 onChange={(e) => {
                    const vId = e.target.value;
                    setSelectedVillageId(vId);
                    
                    if (vId === 'All') {
                        setNewMinister(prev => ({ ...prev, zoneName: 'Central Committee', memberId: '', currentCity: '' }));
                    } else if (vId) {
                        const v = villages.find(vil => vil.id === vId);
                        setNewMinister(prev => ({ ...prev, zoneName: v ? `${v.nameGujarati || v.name} Zone` : '', memberId: '', currentCity: '' }));
                    } else {
                        setNewMinister(prev => ({ ...prev, zoneName: '', memberId: '', currentCity: '' }));
                    }
                 }}
               >
                 <option value="">-- Select Village --</option>
                 {villages.map(v => (
                   <option key={v.id} value={v.id}>{v.nameGujarati || v.name}</option>
                 ))}
                 <option value="All">Central Committee</option>
               </select>
            </div>

            {/* 2. Select Member (Filtered by Village) */}
            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Select Member (HOF Only)</label>
               <select 
                 className="w-full p-2 border rounded bg-white disabled:bg-slate-50 disabled:text-slate-400"
                 value={newMinister.memberId || ''}
                 onChange={e => {
                     const mId = e.target.value;
                     const member = members.find(m => m.id === mId);
                     setNewMinister({
                         ...newMinister, 
                         memberId: mId,
                         currentCity: member?.currentCity || ''
                     });
                 }}
                 disabled={!selectedVillageId}
               >
                 <option value="">-- Select Member --</option>
                 {availableMembers.map(m => (
                   <option key={m.id} value={m.id}>{m.fullName}</option>
                 ))}
                 {selectedVillageId && availableMembers.length === 0 && (
                   <option disabled>No Head of Family found in this village</option>
                 )}
               </select>
            </div>

            {/* 3. Current City (Auto-fetch & Editable) */}
            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Current City</label>
               <input 
                 className="w-full p-2 border rounded bg-white" 
                 placeholder="City"
                 value={newMinister.currentCity || ''}
                 onChange={e => setNewMinister({...newMinister, currentCity: e.target.value})}
               />
            </div>
            
            {/* 4. Role/Designation */}
            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Role / Designation</label>
               <input 
                 className="w-full p-2 border rounded" 
                 placeholder="e.g. President, Secretary"
                 value={newMinister.role || ''}
                 onChange={e => setNewMinister({...newMinister, role: e.target.value})}
               />
            </div>

            <button 
              onClick={handleAdd}
              disabled={!newMinister.memberId || !newMinister.zoneName || !newMinister.role}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Assign
            </button>
         </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministers.map(minister => {
          const member = members.find(m => m.id === minister.memberId);
          return (
            <div key={minister.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Map size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800">{member?.fullName || 'Unknown Member'}</h4>
                    <p className="text-sm text-indigo-600 font-medium">{minister.role}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Zone: {minister.zoneName}</span>
                        {minister.currentCity && (
                            <span className="flex items-center gap-1">
                                <MapPin size={10} /> {minister.currentCity}
                            </span>
                        )}
                    </div>
                 </div>
              </div>
              <button onClick={() => handleDelete(minister.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
        {ministers.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                No ministers assigned yet.
            </div>
        )}
      </div>
    </div>
  );
};

export default ManageMinisters;
