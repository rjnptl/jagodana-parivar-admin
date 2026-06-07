import React, { useState } from 'react';
import { SocialScheme } from '../../types';
import { Edit2, Trash2, Plus, Save, X, ShieldCheck } from 'lucide-react';

interface ManageSchemesProps {
  schemes: SocialScheme[];
  setSchemes: React.Dispatch<React.SetStateAction<SocialScheme[]>>;
}

const ManageSchemes: React.FC<ManageSchemesProps> = ({ schemes, setSchemes }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newScheme, setNewScheme] = useState<Partial<SocialScheme> | null>(null);
  const [editForm, setEditForm] = useState<Partial<SocialScheme>>({});

  const handleAdd = () => {
    const id = `s${Date.now()}`;
    const scheme: SocialScheme = {
      id,
      title: newScheme?.title || 'New Scheme',
      description: newScheme?.description || '',
      eligibility: newScheme?.eligibility || '',
      contactPerson: newScheme?.contactPerson || '',
      amount: newScheme?.amount || '',
    };
    setSchemes([...schemes, scheme]);
    setNewScheme(null);
  };

  const handleUpdate = (id: string) => {
    setSchemes(schemes.map(s => s.id === id ? { ...s, ...editForm } as SocialScheme : s));
    setIsEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this scheme?')) setSchemes(schemes.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manage Social Schemes</h2>
           <p className="text-slate-500">Update welfare programs and scholarship details.</p>
        </div>
        <button onClick={() => setNewScheme({})} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700">
          <Plus size={18} /> Add Scheme
        </button>
      </div>

      {newScheme && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <input placeholder="Title" className="p-2 border rounded" value={newScheme.title || ''} onChange={e => setNewScheme({...newScheme, title: e.target.value})} />
             <input placeholder="Amount" className="p-2 border rounded" value={newScheme.amount || ''} onChange={e => setNewScheme({...newScheme, amount: e.target.value})} />
             <textarea placeholder="Description" className="p-2 border rounded md:col-span-2" value={newScheme.description || ''} onChange={e => setNewScheme({...newScheme, description: e.target.value})} />
             <input placeholder="Eligibility" className="p-2 border rounded" value={newScheme.eligibility || ''} onChange={e => setNewScheme({...newScheme, eligibility: e.target.value})} />
             <input placeholder="Contact Person" className="p-2 border rounded" value={newScheme.contactPerson || ''} onChange={e => setNewScheme({...newScheme, contactPerson: e.target.value})} />
           </div>
           <div className="flex justify-end gap-2">
             <button onClick={() => setNewScheme(null)} className="px-3 py-1 text-slate-600">Cancel</button>
             <button onClick={handleAdd} className="px-3 py-1 bg-emerald-600 text-white rounded">Save</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {schemes.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            {isEditing === s.id ? (
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="border p-2 rounded" placeholder="Title"/>
                    <input value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="border p-2 rounded" placeholder="Amount"/>
                  </div>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="border p-2 rounded w-full" placeholder="Description"/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={editForm.eligibility} onChange={e => setEditForm({...editForm, eligibility: e.target.value})} className="border p-2 rounded" placeholder="Eligibility"/>
                    <input value={editForm.contactPerson} onChange={e => setEditForm({...editForm, contactPerson: e.target.value})} className="border p-2 rounded" placeholder="Contact Person"/>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(s.id)} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"><Save size={16}/> Save</button>
                    <button onClick={() => setIsEditing(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded flex items-center gap-2"><X size={16}/> Cancel</button>
                  </div>
               </div>
            ) : (
               <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="text-emerald-600" size={20} />
                       <h3 className="text-xl font-bold text-slate-800">{s.title}</h3>
                       <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">{s.amount}</span>
                    </div>
                    <p className="text-slate-600 mb-2">{s.description}</p>
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold">Eligibility:</span> {s.eligibility} <span className="mx-2">|</span> 
                      <span className="font-semibold">Contact:</span> {s.contactPerson}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(s.id); setEditForm(s); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageSchemes;