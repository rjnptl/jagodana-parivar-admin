import React, { useEffect, useMemo, useState } from 'react';
import { GetTogetherConfig } from '../../types';
import { Calendar, Clock, Edit2, Loader2, MapPin, Megaphone, Plus, Save, Trash2 } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface ManageEventsProps {
  config: GetTogetherConfig;
  setConfig: React.Dispatch<React.SetStateAction<GetTogetherConfig>>;
}

const emptyEvent: GetTogetherConfig = {
  isEnabled: false,
  isVisible: false,
  villageName: '',
  villageLocation: '',
  date: '',
  eventDate: '',
  time: '',
  eventTime: '',
  title: 'Next Family Get-Together',
  description: '',
};

const ManageEvents: React.FC<ManageEventsProps> = ({ config, setConfig }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams<{ eventId?: string }>();
  const [form, setForm] = useState<GetTogetherConfig>({ ...emptyEvent, ...config });
  const [events, setEvents] = useState<GetTogetherConfig[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const preview = useMemo(() => ({
    title: form.title || 'Next Family Get-Together',
    location: form.villageLocation || form.villageName,
    date: form.eventDate || form.date,
    time: form.eventTime || form.time,
    isVisible: Boolean(form.isVisible ?? form.isEnabled),
  }), [form]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ApiService.getEvents();
      setEvents(data);
      const active = data.find(event => event.isEnabled);
      if (active) setConfig(active);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (field: keyof GetTogetherConfig, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setMessage('');
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!(form.villageLocation || form.villageName).trim()) nextErrors.villageLocation = 'Village Location is required';
    if (!(form.eventDate || form.date).trim()) nextErrors.eventDate = 'Date is required';
    if (!(form.eventTime || form.time).trim()) nextErrors.eventTime = 'Time is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const wasEditing = Boolean(form.id);
      const saved = await ApiService.saveEvent({
        ...form,
        villageName: form.villageLocation || form.villageName,
        villageLocation: form.villageLocation || form.villageName,
        date: form.eventDate || form.date,
        eventDate: form.eventDate || form.date,
        time: form.eventTime || form.time,
        eventTime: form.eventTime || form.time,
        isEnabled: Boolean(form.isVisible ?? form.isEnabled),
        isVisible: Boolean(form.isVisible ?? form.isEnabled),
      });
      setMessage(wasEditing ? 'Event updated successfully.' : 'Event created successfully.');
      setForm({ ...emptyEvent });
      if (saved.isEnabled) setConfig(saved);
      await loadEvents();
      navigate('/admin/events', { replace: true });
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (event: GetTogetherConfig) => {
    setForm({ ...emptyEvent, ...event });
    setErrors({});
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (event.id) navigate(`/admin/events/${encodeURIComponent(event.id)}/edit`);
  };

  useEffect(() => {
    if (location.pathname.endsWith('/events/new')) {
      setForm({ ...emptyEvent });
      return;
    }
    if (eventId && events.length) {
      const selectedEvent = events.find(event => event.id === eventId);
      if (selectedEvent) setForm({ ...emptyEvent, ...selectedEvent });
    }
  }, [eventId, events, location.pathname]);

  const handleToggle = async (event: GetTogetherConfig) => {
    if (!event.id) return;
    setActionId(event.id);
    setError('');
    try {
      const updated = await ApiService.toggleEvent(event.id, !event.isEnabled);
      if (updated.isEnabled) setConfig(updated);
      await loadEvents();
    } catch (toggleError: any) {
      setError(toggleError?.message || 'Failed to update event visibility');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (event: GetTogetherConfig) => {
    if (!event.id || !window.confirm('Delete this event?')) return;
    setActionId(event.id);
    setError('');
    try {
      await ApiService.deleteEvent(event.id);
      if (form.id === event.id) setForm({ ...emptyEvent });
      await loadEvents();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete event');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Events</h2>
          <p className="text-slate-500">Create get-together banners and control what appears on the Member Home Page.</p>
        </div>
        <button onClick={() => { setForm({ ...emptyEvent }); navigate('/admin/events/new'); }} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 flex items-center gap-2">
          <Plus size={16} /> Create New Event
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      {message && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Megaphone size={24} /></div>
             <div>
               <h3 className="text-lg font-bold text-slate-800">{form.id ? 'Edit Get-Together Banner' : 'Next Get-Together Banner'}</h3>
               <p className="text-sm text-slate-500">This banner appears on the Member Home Page when visible.</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <span className={`text-sm font-medium ${preview.isVisible ? 'text-green-600' : 'text-slate-400'}`}>{preview.isVisible ? 'Banner Active' : 'Banner Hidden'}</span>
             <button type="button" onClick={() => handleChange('isVisible', !preview.isVisible)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${preview.isVisible ? 'bg-indigo-600' : 'bg-slate-200'}`}>
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preview.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           </div>
        </div>

        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700 mb-2">Event Details</h4>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Event Title</label>
              <input type="text" value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter Event Title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Village Location <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" value={form.villageLocation || form.villageName || ''} onChange={(e) => handleChange('villageLocation', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter Event Location" />
              </div>
              {errors.villageLocation && <p className="mt-1 text-xs font-medium text-red-600">{errors.villageLocation}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input type="date" value={form.eventDate || form.date || ''} onChange={(e) => handleChange('eventDate', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                {errors.eventDate && <p className="mt-1 text-xs font-medium text-red-600">{errors.eventDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input type="text" value={form.eventTime || form.time || ''} onChange={(e) => handleChange('eventTime', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter Event Time" />
                </div>
                {errors.eventTime && <p className="mt-1 text-xs font-medium text-red-600">{errors.eventTime}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter Event Details (Optional)" />
            </div>
            <button type="submit" disabled={isSaving} className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {form.id ? 'Update Event' : 'Save Event'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-center">
            <h4 className="font-semibold text-slate-400 mb-4 text-xs uppercase tracking-wider text-center">Live Preview</h4>
            <div className={`rounded-xl p-6 text-white shadow-lg transition-all ${preview.isVisible ? 'opacity-100 scale-100' : 'opacity-50 scale-95 grayscale'}`} style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)' }}>
               <div className="flex flex-col items-center text-center space-y-3">
                 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/20">Upcoming Event</div>
                 <h2 className="text-2xl font-bold">{preview.title}</h2>
                 <p className="text-sm text-amber-50">{form.description || 'Event details will appear here.'}</p>
                 <div className="flex flex-wrap justify-center gap-3 text-sm font-medium mt-2">
                   <div className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg"><MapPin size={16} className="mr-1.5" />{preview.location || 'Village Location'}</div>
                   <div className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg"><Calendar size={16} className="mr-1.5" />{preview.date || 'YYYY-MM-DD'}</div>
                   <div className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg"><Clock size={16} className="mr-1.5" />{preview.time || 'HH:MM'}</div>
                 </div>
               </div>
            </div>
            {!preview.isVisible && <p className="text-center text-red-500 text-xs mt-3 font-medium">Banner is currently hidden from users</p>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Event History</h3>
          {isLoading && <Loader2 size={18} className="text-indigo-600 animate-spin" />}
        </div>
        <div className="divide-y divide-slate-100">
          {!isLoading && events.length === 0 && <div className="p-8 text-center text-slate-400">No events created yet.</div>}
          {events.map(event => (
            <div key={event.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-slate-800">{event.title || 'Next Family Get-Together'}</h4>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${event.isEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{event.isEnabled ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} />{event.villageLocation || event.villageName}</span>
                  <span className="inline-flex items-center gap-1"><Calendar size={14} />{event.eventDate || event.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={14} />{event.eventTime || event.time}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => handleToggle(event)} disabled={actionId === event.id} className={`px-3 py-2 rounded-lg text-xs font-bold ${event.isEnabled ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>{event.isEnabled ? 'Hide' : 'Show'}</button>
                <button onClick={() => handleEdit(event)} className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                <button onClick={() => handleDelete(event)} disabled={actionId === event.id} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
