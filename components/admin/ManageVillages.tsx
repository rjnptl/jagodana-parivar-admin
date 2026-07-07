import React, { useEffect, useMemo, useState } from 'react';
import { Village } from '../../types';
import { Edit2, Trash2, Plus, X, Save, MapPin, Loader2, Search } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface ManageVillagesProps {
  villages: Village[];
  setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
}

const ManageVillages: React.FC<ManageVillagesProps> = ({ villages, setVillages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { villageCode } = useParams<{ villageCode?: string }>();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newVillage, setNewVillage] = useState<Partial<Village> | null>(null);
  const [editForm, setEditForm] = useState<Partial<Village>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVillages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return villages;
    }

    return villages.filter(v => {
      const englishName = v.name?.toLowerCase() || '';
      const villageCode = v.villageCode?.toLowerCase() || '';
      return englishName.includes(query) || villageCode.includes(query);
    });
  }, [searchTerm, villages]);

  const loadVillages = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllVillages();
      setVillages(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load villages';
      setError(message);
      console.error('Error loading villages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newVillage?.name || !newVillage?.nameGujarati || !newVillage?.district || !newVillage?.villageCode) {
      setError('English Name, Gujarati Name, Village Code, and District are required');
      return;
    }

    try {
      setSavingId('new');
      await ApiService.createVillage(
        newVillage.name,
        newVillage.nameGujarati,
        newVillage.district,
        newVillage.villageCode
      );
      await loadVillages();
      setNewVillage(null);
      setError(null);
      navigate('/admin/villages', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create village';
      console.error('Error creating village:', message);
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name || !editForm.nameGujarati || !editForm.district || !editForm.villageCode) {
      setError('English Name, Gujarati Name, Village Code, and District are required');
      return;
    }

    try {
      setSavingId(id);
      await ApiService.updateVillage(
        id,
        editForm.name,
        editForm.nameGujarati,
        editForm.district,
        editForm.villageCode
      );
      await loadVillages();
      setIsEditing(null);
      setError(null);
      navigate('/admin/villages', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update village';
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this village?')) return;

    try {
      setSavingId(id);
      await ApiService.deleteVillage(id);
      await loadVillages();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete village';
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (v: Village) => {
    setIsEditing(v.id);
    setEditForm(v);
    setError(null);
  };

  useEffect(() => {
    if (location.pathname.endsWith('/villages/new')) {
      setNewVillage(current => current || {});
      return;
    }
    if (villageCode) {
      const village = villages.find(item => item.villageCode === villageCode || item.id === villageCode);
      if (village) startEdit(village);
    }
  }, [location.pathname, villageCode, villages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Villages</h2>
          <p className="text-slate-500">Add or update village details.</p>
        </div>
        <button 
          onClick={() => {
            setNewVillage({});
            setError(null);
            navigate('/admin/villages/new');
          }}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={18} /> Add Village
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Villages</p>
          <p className="text-2xl font-bold text-slate-800">{villages.length}</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search English name or village code"
            className="w-full pl-10 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && !villages.length && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add Form */}
      {newVillage && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl animate-fade-in">
           <h3 className="font-bold text-indigo-900 mb-3">Add New Village</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
             <input 
               placeholder="Enter Village Name (English)"
               className="p-2 rounded border border-indigo-200"
               value={newVillage.name || ''}
               onChange={e => setNewVillage({...newVillage, name: e.target.value})}
             />
             <input 
               placeholder="ગામનું નામ (ગુજરાતી)" 
               className="p-2 rounded border border-indigo-200"
               value={newVillage.nameGujarati || ''}
               onChange={e => setNewVillage({...newVillage, nameGujarati: e.target.value})}
             />
             <input 
               placeholder="Enter Village Code"
               className="p-2 rounded border border-indigo-200"
               value={newVillage.villageCode || ''}
               onChange={e => setNewVillage({...newVillage, villageCode: e.target.value})}
             />
             <input 
               placeholder="Enter District"
               className="p-2 rounded border border-indigo-200"
               value={newVillage.district || ''}
               onChange={e => setNewVillage({...newVillage, district: e.target.value})}
             />
           </div>
           <div className="flex justify-end gap-2">
             <button onClick={() => { setNewVillage(null); navigate('/admin/villages'); }} className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
             <button 
               onClick={handleAdd} 
               disabled={savingId === 'new'}
               className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
             >
               {savingId === 'new' ? <Loader2 size={16} className="animate-spin" /> : null}
               Save Village
             </button>
           </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVillages.map(v => (
          <div key={v.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
             {isEditing === v.id ? (
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 w-full">
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border p-2 rounded" placeholder="Enter Village Name (English)" />
                  <input value={editForm.nameGujarati || ''} onChange={e => setEditForm({...editForm, nameGujarati: e.target.value})} className="border p-2 rounded" placeholder="ગામનું નામ (ગુજરાતી)" />
                  <input value={editForm.villageCode || ''} onChange={e => setEditForm({...editForm, villageCode: e.target.value})} className="border p-2 rounded" placeholder="Enter Village Code" />
                  <input value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} className="border p-2 rounded" placeholder="Enter District" />
               </div>
             ) : (
               <div className="flex-1">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-indigo-500"/> {v.nameGujarati || v.name}</h3>
                 <p className="text-slate-500 text-sm">{v.name} | {v.district}{v.villageCode ? ` | ${v.villageCode}` : ''}</p>
               </div>
             )}

             <div className="flex items-center gap-2">
               {isEditing === v.id ? (
                 <>
                   <button 
                     onClick={() => handleUpdate(v.id)} 
                     disabled={savingId === v.id}
                     className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                   >
                     {savingId === v.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                   </button>
                   <button onClick={() => { setIsEditing(null); navigate('/admin/villages'); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded"><X size={18}/></button>
                 </>
               ) : (
                 <>
                   <button onClick={() => { startEdit(v); navigate('/admin/villages/' + encodeURIComponent(v.villageCode || v.id) + '/edit'); }} disabled={savingId !== null} className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"><Edit2 size={18}/></button>
                   <button 
                     onClick={() => handleDelete(v.id)} 
                     disabled={savingId === v.id}
                     className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                   >
                     {savingId === v.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                   </button>
                 </>
               )}
             </div>
          </div>
        ))}
        {!loading && filteredVillages.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            No villages found for this search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVillages;
