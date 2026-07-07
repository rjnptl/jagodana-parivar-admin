
import React, { useEffect, useMemo, useState } from 'react';
import { Member, Village, ZoneMinister } from '../../types';
import { Trash2, Edit2, UserPlus, Map, MapPin, Phone, X, Loader2, Save } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import SearchableMemberSelect from '../common/SearchableMemberSelect';

interface ManageMinistersProps {
  ministers: ZoneMinister[];
  setMinisters: React.Dispatch<React.SetStateAction<ZoneMinister[]>>;
  villages: Village[];
}

interface MinisterForm {
  id?: string;
  villageId: string;
  memberId: string;
  role: string;
}

const emptyMinister: MinisterForm = { villageId: '', memberId: '', role: '' };

const ManageMinisters: React.FC<ManageMinistersProps> = ({ ministers, setMinisters, villages }) => {
  const [form, setForm] = useState<MinisterForm>({ ...emptyMinister });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [villageMembers, setVillageMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMinisters = async () => {
    setIsLoading(true);
    try {
      setMinisters(await ApiService.getAdminZoneMinisters());
      setError('');
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load zone ministers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMinisters();
  }, []);

  // Load village members whenever the selected village changes.
  useEffect(() => {
    if (!form.villageId) {
      setVillageMembers([]);
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    ApiService.getVillageMembers(form.villageId)
      .then(members => { if (!cancelled) setVillageMembers(members); })
      .catch((membersError: any) => { if (!cancelled) setError(membersError?.message || 'Failed to load village members'); })
      .finally(() => { if (!cancelled) setMembersLoading(false); });
    return () => { cancelled = true; };
  }, [form.villageId]);

  const selectedMember = useMemo(
    () => villageMembers.find(member => member.id === form.memberId) || null,
    [villageMembers, form.memberId],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.villageId) nextErrors.villageId = 'Village is required';
    if (!form.memberId) nextErrors.memberId = 'Member is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm({ ...emptyMinister });
    setErrors({});
    setVillageMembers([]);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setError('');
    try {
      const payload = { memberId: form.memberId, role: form.role.trim() || undefined };
      if (form.id) {
        await ApiService.updateZoneMinister(form.villageId, form.id, payload);
        setMessage('Zone minister updated successfully.');
      } else {
        await ApiService.createZoneMinister(form.villageId, payload);
        setMessage('Zone minister assigned successfully.');
      }
      resetForm();
      await loadMinisters();
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save zone minister');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (minister: ZoneMinister) => {
    if (!window.confirm(`Remove ${minister.memberName || 'this member'} as contact person for ${minister.villageName || 'this village'}?`)) return;
    setActionId(minister.id);
    setError('');
    try {
      await ApiService.deleteZoneMinister(minister.villageId, minister.id);
      setMessage('Zone minister removed successfully.');
      if (form.id === minister.id) resetForm();
      await loadMinisters();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to remove zone minister');
    } finally {
      setActionId(null);
    }
  };

  const startEdit = (minister: ZoneMinister) => {
    setForm({
      id: minister.id,
      villageId: minister.villageId,
      memberId: minister.memberId,
      role: minister.role || '',
    });
    setErrors({});
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Zone Ministers</h2>
        <p className="text-slate-500">Assign contact persons for specific village zones.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><X size={18} /></button>
        </div>
      )}
      {message && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}

      {/* Assign / Edit Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
           <UserPlus size={20} className="text-indigo-600"/> {form.id ? 'Edit Contact Person' : 'Assign New Contact Person'}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Village *</label>
               <select
                 className="w-full p-2 border rounded bg-white disabled:bg-slate-50 disabled:text-slate-400"
                 value={form.villageId}
                 disabled={Boolean(form.id)}
                 onChange={(e) => {
                    setForm(prev => ({ ...prev, villageId: e.target.value, memberId: '' }));
                    setErrors(prev => ({ ...prev, villageId: '', memberId: '' }));
                 }}
               >
                 <option value="">-- Select Village --</option>
                 {villages.map(village => (
                   <option key={village.id} value={village.id}>{village.nameGujarati || village.name}</option>
                 ))}
               </select>
               {errors.villageId && <p className="mt-1 text-xs font-medium text-red-600">{errors.villageId}</p>}
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Member *</label>
               <SearchableMemberSelect
                 members={villageMembers}
                 value={form.memberId}
                 onChange={memberId => {
                   setForm(prev => ({ ...prev, memberId }));
                   setErrors(prev => ({ ...prev, memberId: '' }));
                 }}
                 disabled={!form.villageId}
                 loading={membersLoading}
               />
               {errors.memberId && <p className="mt-1 text-xs font-medium text-red-600">{errors.memberId}</p>}
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Current City (auto)</label>
               <div className="w-full p-2 border rounded bg-slate-50 text-slate-600 flex items-center gap-2 min-h-[38px] text-sm">
                 <MapPin size={14} className="text-slate-400 shrink-0" />
                 {selectedMember?.currentCity || <span className="text-slate-400">Select a member</span>}
               </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Role / Designation</label>
               <input
                 className="w-full p-2 border rounded"
                 placeholder="Enter Position or Role (optional)"
                 value={form.role}
                 onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
               />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {form.id ? 'Update' : 'Assign'}
              </button>
              {form.id && (
                <button onClick={resetForm} className="px-3 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200" title="Cancel edit">
                  <X size={16} />
                </button>
              )}
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Village</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Current City</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ministers.map(minister => (
                <tr key={minister.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <Map size={16} className="text-indigo-500" /> {minister.villageNameGujarati || minister.villageName || '-'}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{minister.memberName || 'Unknown Member'}</p>
                    {minister.familyCode && <p className="text-xs text-slate-400 font-mono">{minister.familyCode}</p>}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {minister.mobileNumber ? <span className="flex items-center gap-1"><Phone size={14} className="text-slate-400" /> {minister.mobileNumber}</span> : '-'}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{minister.currentCity || '-'}</td>
                  <td className="p-4 text-sm text-indigo-600 font-medium">{minister.role || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(minister)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(minister)} disabled={actionId === minister.id} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50" title="Delete">
                        {actionId === minister.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && ministers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No ministers assigned yet.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 size={18} className="animate-spin" /> Loading zone ministers...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageMinisters;
