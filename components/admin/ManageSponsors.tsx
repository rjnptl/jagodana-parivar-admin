
import React, { useEffect, useMemo, useState } from 'react';
import { Member, SocialScheme, Sponsor, SponsorType, Village } from '../../types';
import { Plus, Trash2, Edit2, IndianRupee, Calendar, X, Loader2, Save, Phone, Award } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiService } from '../../services/apiService';
import ToggleSwitch from '../common/ToggleSwitch';
import SearchableMemberSelect from '../common/SearchableMemberSelect';

interface ManageSponsorsProps {
  sponsors: Sponsor[];
  setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
  schemes: SocialScheme[];
  villages: Village[];
}

interface SponsorForm {
  id?: string;
  villageId: string;
  sponsorMemberId: string;
  amount: string;
  schemeId: string;
  eventName: string;
  sponsorshipDate: string;
  sponsorType: SponsorType | '';
  isVisibleOnMemberUI: boolean;
  contactNumber: string;
}

const emptySponsor: SponsorForm = {
  villageId: '',
  sponsorMemberId: '',
  amount: '',
  schemeId: '',
  eventName: '',
  sponsorshipDate: '',
  sponsorType: '',
  isVisibleOnMemberUI: true,
  contactNumber: '',
};

const formatAmount = (amount: string) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
};

const ManageSponsors: React.FC<ManageSponsorsProps> = ({ sponsors, setSponsors, schemes, villages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sponsorId } = useParams<{ sponsorId?: string }>();
  const [form, setForm] = useState<SponsorForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [villageMembers, setVillageMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadSponsors = async () => {
    setIsLoading(true);
    try {
      setSponsors(await ApiService.getAdminSponsors());
      setError('');
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  useEffect(() => {
    if (location.pathname.endsWith('/sponsors/new')) {
      setForm(current => current && !current.id ? current : { ...emptySponsor });
      return;
    }
    if (sponsorId) {
      const sponsor = sponsors.find(item => item.id === sponsorId);
      if (sponsor) {
        setForm({
          id: sponsor.id,
          villageId: sponsor.villageId,
          sponsorMemberId: sponsor.sponsorMemberId,
          amount: sponsor.amount,
          schemeId: sponsor.schemeId || '',
          eventName: sponsor.eventName,
          sponsorshipDate: sponsor.sponsorshipDate,
          sponsorType: sponsor.sponsorType,
          isVisibleOnMemberUI: sponsor.isVisibleOnMemberUI,
          contactNumber: sponsor.contactNumber,
        });
        setErrors({});
      }
    }
  }, [location.pathname, sponsorId, sponsors]);

  // Load the member list whenever the form's village changes.
  useEffect(() => {
    const villageId = form?.villageId;
    if (!villageId) {
      setVillageMembers([]);
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    ApiService.getVillageMembers(villageId)
      .then(members => { if (!cancelled) setVillageMembers(members); })
      .catch((membersError: any) => { if (!cancelled) setError(membersError?.message || 'Failed to load village members'); })
      .finally(() => { if (!cancelled) setMembersLoading(false); });
    return () => { cancelled = true; };
  }, [form?.villageId]);

  const selectedMember = useMemo(
    () => villageMembers.find(member => member.id === form?.sponsorMemberId) || null,
    [villageMembers, form?.sponsorMemberId],
  );

  // Contact rule (mirrors backend): member's own number, else their family head's.
  const resolvedContact = useMemo(() => {
    if (!form) return '';
    if (selectedMember) {
      if (selectedMember.mobile) return selectedMember.mobile;
      const head = villageMembers.find(member => member.familyId === selectedMember.familyId && member.headOfHousehold);
      return head?.mobile || '';
    }
    return form.contactNumber || '';
  }, [form, selectedMember, villageMembers]);

  const handleChange = (field: keyof SponsorForm, value: any) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
    setErrors(prev => ({ ...prev, [field]: '' }));
    setMessage('');
  };

  const handleVillageChange = (villageId: string) => {
    setForm(prev => prev ? { ...prev, villageId, sponsorMemberId: '', contactNumber: '' } : prev);
    setErrors(prev => ({ ...prev, villageId: '', sponsorMemberId: '' }));
  };

  const validate = (candidate: SponsorForm) => {
    const nextErrors: Record<string, string> = {};
    if (!candidate.villageId) nextErrors.villageId = 'Village is required';
    if (!candidate.sponsorMemberId) nextErrors.sponsorMemberId = 'Sponsor member is required';
    if (!candidate.eventName.trim()) nextErrors.eventName = 'Event name is required';
    const amount = Number(candidate.amount);
    if (!candidate.amount || !Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Enter a valid positive amount';
    if (!candidate.sponsorshipDate) nextErrors.sponsorshipDate = 'Date is required';
    if (!candidate.sponsorType) nextErrors.sponsorType = 'Select a sponsor type';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const closeForm = () => {
    setForm(null);
    setErrors({});
    setVillageMembers([]);
    navigate('/admin/sponsors', { replace: true });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || !validate(form)) return;

    setIsSaving(true);
    setError('');
    try {
      const payload = {
        villageId: Number(form.villageId),
        sponsorMemberId: Number(form.sponsorMemberId),
        schemeId: form.schemeId ? Number(form.schemeId) : null,
        eventName: form.eventName.trim(),
        amount: Number(form.amount),
        sponsorshipDate: form.sponsorshipDate,
        sponsorType: form.sponsorType,
        isVisibleOnMemberUI: form.isVisibleOnMemberUI,
        // Send the client-resolved number ('' lets the backend re-resolve from the member).
        contactNumber: selectedMember ? resolvedContact : (form.contactNumber || ''),
      };
      if (form.id) {
        await ApiService.updateSponsor(form.id, payload);
        setMessage('Sponsor updated successfully.');
      } else {
        await ApiService.createSponsor(payload);
        setMessage('Sponsor added successfully.');
      }
      await loadSponsors();
      closeForm();
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save sponsor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (sponsor: Sponsor) => {
    if (!window.confirm(`Delete sponsorship record for "${sponsor.sponsorName}"?`)) return;
    setActionId(sponsor.id);
    setError('');
    try {
      await ApiService.deleteSponsor(sponsor.id);
      setMessage('Sponsor deleted successfully.');
      if (form?.id === sponsor.id) closeForm();
      await loadSponsors();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete sponsor');
    } finally {
      setActionId(null);
    }
  };

  const startEdit = (sponsor: Sponsor) => {
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/admin/sponsors/${encodeURIComponent(sponsor.id)}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Sponsors</h2>
          <p className="text-slate-500">Track donations and community support.</p>
        </div>
        <button onClick={() => { setForm({ ...emptySponsor }); setErrors({}); setMessage(''); navigate('/admin/sponsors/new'); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-700">
          <Plus size={18} /> Add Sponsor
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
        <form onSubmit={handleSave} className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4 animate-fade-in">
           <div className="flex items-center justify-between mb-3">
             <h3 className="font-bold text-amber-900">{form.id ? 'Edit Sponsorship' : 'Add New Sponsorship'}</h3>
             <ToggleSwitch
               checked={form.isVisibleOnMemberUI}
               onChange={next => handleChange('isVisibleOnMemberUI', next)}
               activeLabel="Visible on Member UI"
               inactiveLabel="Hidden from Member UI"
             />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Village *</label>
               <select
                 className="w-full p-2 border rounded bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                 value={form.villageId}
                 onChange={e => handleVillageChange(e.target.value)}
               >
                 <option value="">-- Select Village --</option>
                 {villages.map(village => (
                   <option key={village.id} value={village.id}>{village.nameGujarati || village.name}</option>
                 ))}
               </select>
               {errors.villageId && <p className="mt-1 text-xs font-medium text-red-600">{errors.villageId}</p>}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Sponsor Member *</label>
               <SearchableMemberSelect
                 members={villageMembers}
                 value={form.sponsorMemberId}
                 onChange={memberId => handleChange('sponsorMemberId', memberId)}
                 disabled={!form.villageId}
                 loading={membersLoading}
               />
               {errors.sponsorMemberId && <p className="mt-1 text-xs font-medium text-red-600">{errors.sponsorMemberId}</p>}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Amount *</label>
               <input
                 type="number"
                 min="1"
                 step="any"
                 inputMode="numeric"
                 placeholder="Enter Sponsorship Amount"
                 className="w-full p-2 border rounded"
                 value={form.amount}
                 onChange={e => handleChange('amount', e.target.value)}
               />
               {errors.amount && <p className="mt-1 text-xs font-medium text-red-600">{errors.amount}</p>}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Scheme (Optional)</label>
               <select
                 className="w-full p-2 border rounded bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                 value={form.schemeId}
                 onChange={e => handleChange('schemeId', e.target.value)}
               >
                 <option value="">None</option>
                 {schemes.map(scheme => (
                   <option key={scheme.id} value={scheme.id}>{scheme.title}{scheme.isActive ? '' : ' (hidden)'}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Event Name *</label>
               <input
                 placeholder="What are they sponsoring for?"
                 className="w-full p-2 border rounded"
                 value={form.eventName}
                 onChange={e => handleChange('eventName', e.target.value)}
               />
               {errors.eventName && <p className="mt-1 text-xs font-medium text-red-600">{errors.eventName}</p>}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Number (auto-filled)</label>
               <div className="w-full p-2 border rounded bg-slate-50 text-slate-600 flex items-center gap-2 min-h-[38px]">
                 <Phone size={14} className="text-slate-400 shrink-0" />
                 {resolvedContact || <span className="text-slate-400 text-sm">{form.sponsorMemberId ? 'No number found — family head has no mobile' : 'Select a member to auto-fill'}</span>}
               </div>
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Date *</label>
               <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.sponsorshipDate}
                  onChange={e => handleChange('sponsorshipDate', e.target.value)}
               />
               {errors.sponsorshipDate && <p className="mt-1 text-xs font-medium text-red-600">{errors.sponsorshipDate}</p>}
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">Sponsor Type *</label>
               <div className="flex items-center gap-6 p-2">
                 {(['lifetime', 'one-time'] as SponsorType[]).map(type => (
                   <label key={type} className="flex items-center gap-2 cursor-pointer">
                     <input
                       type="radio"
                       name="sponsorType"
                       value={type}
                       checked={form.sponsorType === type}
                       onChange={() => handleChange('sponsorType', type)}
                       className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 cursor-pointer"
                     />
                     <span className="text-sm font-medium text-slate-700">{type === 'lifetime' ? 'Lifetime' : 'One-time'}</span>
                   </label>
                 ))}
               </div>
               {errors.sponsorType && <p className="mt-1 text-xs font-medium text-red-600">{errors.sponsorType}</p>}
             </div>
           </div>

           <div className="flex justify-end gap-2 border-t border-amber-100 pt-3">
             <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
             <button type="submit" disabled={isSaving} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               {form.id ? 'Update Record' : 'Save Record'}
             </button>
           </div>
        </form>
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
              <th className="p-4">Type</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sponsors.map(sponsor => (
              <tr key={sponsor.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-800">{sponsor.sponsorName}</p>
                  {sponsor.familyCode && <p className="text-xs text-slate-400 font-mono">{sponsor.familyCode}</p>}
                </td>
                <td className="p-4 text-emerald-600 font-bold"><span className="flex items-center gap-1"><IndianRupee size={14}/> {formatAmount(sponsor.amount)}</span></td>
                <td className="p-4 text-slate-600">
                  <span className="inline-block bg-slate-100 px-2 py-1 rounded text-sm">{sponsor.eventName}</span>
                  {sponsor.schemeTitle && <p className="text-xs text-slate-400 mt-1">Scheme: {sponsor.schemeTitle}</p>}
                </td>
                <td className="p-4 text-slate-600 text-sm">{sponsor.contactNumber}</td>
                <td className="p-4 text-slate-500 text-sm"><span className="flex items-center gap-1"><Calendar size={14}/> {sponsor.sponsorshipDate}</span></td>
                <td className="p-4">
                  {sponsor.sponsorType === 'lifetime' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Award size={12} /> Lifetime</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">One-time</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${sponsor.isVisibleOnMemberUI ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {sponsor.isVisibleOnMemberUI ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(sponsor)} className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50" title="Edit">
                      <Edit2 size={18}/>
                    </button>
                    <button onClick={() => handleDelete(sponsor)} disabled={actionId === sponsor.id} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-50" title="Delete">
                      {actionId === sponsor.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && sponsors.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No sponsors added yet. Click "Add Sponsor" to begin.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={8} className="p-8">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 size={18} className="animate-spin" /> Loading sponsors...
                  </div>
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
