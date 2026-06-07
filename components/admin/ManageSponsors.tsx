
import React, { useState } from 'react';
import { Sponsor, SocialScheme } from '../../types';
import { Plus, Trash2, IndianRupee, Calendar, ListFilter, X } from 'lucide-react';

interface ManageSponsorsProps {
  sponsors: Sponsor[];
  setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
  schemes: SocialScheme[];
}

const ManageSponsors: React.FC<ManageSponsorsProps> = ({ sponsors, setSponsors, schemes }) => {
  const [newSponsor, setNewSponsor] = useState<Partial<Sponsor> | null>(null);
  const [useCustomScheme, setUseCustomScheme] = useState(false);

  const handleAdd = () => {
    if (!newSponsor?.name) return;
    const sponsor: Sponsor = {
      id: `sp${Date.now()}`,
      name: newSponsor.name,
      amount: newSponsor.amount || '',
      eventOrScheme: newSponsor.eventOrScheme || '',
      contactNumber: newSponsor.contactNumber || '',
      date: newSponsor.date || new Date().toISOString().split('T')[0],
    };
    setSponsors([...sponsors, sponsor]);
    setNewSponsor(null);
    setUseCustomScheme(false);
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this sponsor?")) {
        setSponsors(sponsors.filter(s => s.id !== id));
    }
  };

  const handleCancel = () => {
    setNewSponsor(null);
    setUseCustomScheme(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Sponsors</h2>
          <p className="text-slate-500">Track donations and community support.</p>
        </div>
        <button onClick={() => setNewSponsor({})} className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-700">
          <Plus size={18} /> Add Sponsor
        </button>
      </div>

      {newSponsor && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4 animate-fade-in">
           <h3 className="font-bold text-amber-900 mb-3">Add New Sponsorship</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Sponsor Name</label>
               <input 
                 placeholder="Enter Name" 
                 className="w-full p-2 border rounded" 
                 value={newSponsor.name || ''} 
                 onChange={e => setNewSponsor({...newSponsor, name: e.target.value})} 
               />
             </div>
             
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Amount</label>
               <input 
                 placeholder="e.g. ₹50,000" 
                 className="w-full p-2 border rounded" 
                 value={newSponsor.amount || ''} 
                 onChange={e => setNewSponsor({...newSponsor, amount: e.target.value})} 
               />
             </div>

             <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Event or Scheme</label>
                {!useCustomScheme ? (
                  <select 
                    className="w-full p-2 border rounded bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                    value={newSponsor.eventOrScheme || ''}
                    onChange={(e) => {
                       const val = e.target.value;
                       if (val === 'custom_entry') {
                         setUseCustomScheme(true);
                         setNewSponsor({...newSponsor, eventOrScheme: ''});
                       } else {
                         setNewSponsor({...newSponsor, eventOrScheme: val});
                       }
                    }}
                  >
                    <option value="">-- Select Scheme --</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                    <option value="custom_entry" className="text-amber-600 font-semibold">+ Other / Manual Entry</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      placeholder="Enter Custom Event/Scheme" 
                      className="w-full p-2 border rounded" 
                      value={newSponsor.eventOrScheme || ''} 
                      onChange={e => setNewSponsor({...newSponsor, eventOrScheme: e.target.value})}
                      autoFocus
                    />
                    <button 
                      onClick={() => { setUseCustomScheme(false); setNewSponsor({...newSponsor, eventOrScheme: ''}); }}
                      className="px-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                      title="Back to List"
                    >
                      <ListFilter size={16} />
                    </button>
                  </div>
                )}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Number</label>
               <input 
                 placeholder="Mobile Number" 
                 className="w-full p-2 border rounded" 
                 value={newSponsor.contactNumber || ''} 
                 onChange={e => setNewSponsor({...newSponsor, contactNumber: e.target.value})} 
               />
             </div>
             
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
               <input 
                  type="date" 
                  className="w-full p-2 border rounded" 
                  value={newSponsor.date || ''} 
                  onChange={e => setNewSponsor({...newSponsor, date: e.target.value})} 
               />
             </div>
           </div>
           
           <div className="flex justify-end gap-2 border-t border-amber-100 pt-3">
             <button onClick={handleCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
             <button onClick={handleAdd} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">Save Record</button>
           </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Contribution</th>
              <th className="p-4">Event/Scheme</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sponsors.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{s.name}</td>
                <td className="p-4 text-emerald-600 font-bold flex items-center gap-1"><IndianRupee size={14}/> {s.amount}</td>
                <td className="p-4 text-slate-600">
                  <span className="inline-block bg-slate-100 px-2 py-1 rounded text-sm">{s.eventOrScheme}</span>
                </td>
                <td className="p-4 text-slate-600 text-sm">{s.contactNumber}</td>
                <td className="p-4 text-slate-500 flex items-center gap-1 text-sm"><Calendar size={14}/> {s.date}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No sponsors added yet. Click "Add Sponsor" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSponsors;
