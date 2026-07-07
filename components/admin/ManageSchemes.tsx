import React, { useEffect, useState } from 'react';
import { Member, SocialScheme } from '../../types';
import { Edit2, Trash2, Plus, Save, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiService } from '../../services/apiService';
import { formatMemberDisplayName } from '../../services/nameFormatter';
import ToggleSwitch from '../common/ToggleSwitch';
import SearchableMemberSelect from '../common/SearchableMemberSelect';

interface ManageSchemesProps {
  schemes: SocialScheme[];
  setSchemes: React.Dispatch<React.SetStateAction<SocialScheme[]>>;
}

type SchemeForm = Omit<SocialScheme, 'id'> & { id?: string };

const emptyScheme: SchemeForm = {
  title: '',
  description: '',
  eligibilityCriteria: '',
  contactPersonName: '',
  isActive: false,
};

const ManageSchemes: React.FC<ManageSchemesProps> = ({ schemes, setSchemes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schemeId } = useParams<{ schemeId?: string }>();
  const [form, setForm] = useState<SchemeForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactMembers, setContactMembers] = useState<Member[]>([]);
  const [contactMembersLoading, setContactMembersLoading] = useState(false);
  const [contactMemberId, setContactMemberId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadSchemes = async () => {
    setIsLoading(true);
    try {
      setSchemes(await ApiService.getAdminSchemes());
      setError('');
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load schemes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    if (location.pathname.endsWith('/schemes/new')) {
      setForm(current => current?.id ? { ...emptyScheme } : (current || { ...emptyScheme }));
      return;
    }
    if (schemeId) {
      const scheme = schemes.find(item => item.id === schemeId);
      if (scheme) {
        setForm({ ...scheme });
        setErrors({});
      }
    }
  }, [location.pathname, schemeId, schemes]);

  // Load the community-wide member list once, for the contact person picker.
  useEffect(() => {
    if (!form || contactMembers.length || contactMembersLoading) return;
    setContactMembersLoading(true);
    ApiService.getMembers()
      .then(setContactMembers)
      .catch((membersError: any) => setError(membersError?.message || 'Failed to load members for contact selection'))
      .finally(() => setContactMembersLoading(false));
  }, [form !== null]);

  // When editing, try to re-match the stored contact name back to a member.
  useEffect(() => {
    if (!form) {
      setContactMemberId('');
      return;
    }
    const matched = contactMembers.find(member => formatMemberDisplayName(member) === form.contactPersonName);
    setContactMemberId(matched?.id || '');
  }, [form?.id, contactMembers]);

  const handleContactSelect = (memberId: string, member: Member | null) => {
    setContactMemberId(memberId);
    handleChange('contactPersonName', member ? formatMemberDisplayName(member) : '');
  };

  const handleChange = (field: keyof SchemeForm, value: any) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
    setErrors(prev => ({ ...prev, [field]: '' }));
    setMessage('');
  };

  const validate = (candidate: SchemeForm) => {
    const nextErrors: Record<string, string> = {};
    if (!candidate.title.trim()) nextErrors.title = 'Title is required';
    if (!candidate.description.trim()) nextErrors.description = 'Description is required';
    if (!candidate.eligibilityCriteria.trim()) nextErrors.eligibilityCriteria = 'Eligibility criteria is required';
    if (!candidate.contactPersonName.trim()) nextErrors.contactPersonName = 'Contact person is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const closeForm = () => {
    setForm(null);
    setErrors({});
    navigate('/admin/schemes', { replace: true });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || !validate(form)) return;

    setIsSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        eligibilityCriteria: form.eligibilityCriteria.trim(),
        contactPersonName: form.contactPersonName.trim(),
        isActive: form.isActive,
      };
      if (form.id) {
        await ApiService.updateScheme(form.id, payload);
        setMessage('Scheme updated successfully.');
      } else {
        await ApiService.createScheme(payload);
        setMessage('Scheme created successfully.');
      }
      await loadSchemes();
      closeForm();
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save scheme');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scheme: SocialScheme) => {
    if (!window.confirm(`Delete scheme "${scheme.title}"? Sponsors linked to it will be kept but unlinked.`)) return;
    setActionId(scheme.id);
    setError('');
    try {
      await ApiService.deleteScheme(scheme.id);
      setMessage('Scheme deleted successfully.');
      if (form?.id === scheme.id) closeForm();
      await loadSchemes();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete scheme');
    } finally {
      setActionId(null);
    }
  };

  const startEdit = (scheme: SocialScheme) => {
    setForm({ ...scheme });
    setErrors({});
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/admin/schemes/${encodeURIComponent(scheme.id)}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manage Social Schemes</h2>
           <p className="text-slate-500">Update welfare programs and scholarship details.</p>
        </div>
        <button onClick={() => { setForm({ ...emptyScheme }); setErrors({}); setMessage(''); navigate('/admin/schemes/new'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700">
          <Plus size={18} /> Add Scheme
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><X size={18} /></button>
        </div>
      )}
      {message && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}

      {form && (
        <form onSubmit={handleSave} className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl animate-fade-in">
           <div className="flex items-center justify-between mb-3">
             <h3 className="font-bold text-emerald-900">{form.id ? 'Edit Scheme' : 'Add New Scheme'}</h3>
             <ToggleSwitch
               checked={form.isActive}
               onChange={next => handleChange('isActive', next)}
               activeLabel="Active on Member UI"
               inactiveLabel="Hidden from Member UI"
             />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Scheme Title *</label>
               <input placeholder="Enter Scheme Title" className="w-full p-2 border rounded" value={form.title} onChange={e => handleChange('title', e.target.value)} />
               {errors.title && <p className="mt-1 text-xs font-medium text-red-600">{errors.title}</p>}
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Person *</label>
               <SearchableMemberSelect
                 members={contactMembers}
                 value={contactMemberId}
                 onChange={handleContactSelect}
                 loading={contactMembersLoading}
                 fallbackLabel={form.contactPersonName || undefined}
               />
               {errors.contactPersonName && <p className="mt-1 text-xs font-medium text-red-600">{errors.contactPersonName}</p>}
             </div>
             <div className="md:col-span-2">
               <textarea placeholder="Enter Scheme Description *" rows={3} className="w-full p-3 border rounded-xl" value={form.description} onChange={e => handleChange('description', e.target.value)} />
               {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description}</p>}
             </div>
             <div className="md:col-span-2">
               <textarea placeholder="Enter Eligibility Criteria *" rows={2} className="w-full p-3 border rounded-xl" value={form.eligibilityCriteria} onChange={e => handleChange('eligibilityCriteria', e.target.value)} />
               {errors.eligibilityCriteria && <p className="mt-1 text-xs font-medium text-red-600">{errors.eligibilityCriteria}</p>}
             </div>
           </div>
           <div className="flex justify-end gap-2">
             <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
             <button type="submit" disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               {form.id ? 'Update Scheme' : 'Save Scheme'}
             </button>
           </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Scheme</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map(scheme => (
                <tr key={scheme.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                      <div>
                        <p className="font-bold text-slate-800">{scheme.title}</p>
                        <p className="text-sm text-slate-500 line-clamp-2">{scheme.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{scheme.contactPersonName || '-'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${scheme.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {scheme.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(scheme)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(scheme)} disabled={actionId === scheme.id} className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-50" title="Delete">
                        {actionId === scheme.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && schemes.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No schemes created yet. Click "Add Scheme" to begin.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 size={18} className="animate-spin" /> Loading schemes...
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

export default ManageSchemes;
