import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ExternalLink, Loader2, RefreshCw, Search, TimerOff } from 'lucide-react';
import { ApiService, OtpRequestRecord } from '../../services/apiService';

const buildWhatsappUrl = (request: OtpRequestRecord) => {
  const firstName = request.firstName || 'Member';
  const text = `\u0aa8\u0aae\u0ab8\u0acd\u0aa4\u0ac7 ${firstName}, \u0aa4\u0aae\u0abe\u0ab0\u0acb Jagodana Family registration OTP \u0a85\u0ab9\u0ac0\u0a82 \u0aae\u0acb\u0a95\u0ab2\u0ab5\u0abe\u0aae\u0abe\u0a82 \u0a86\u0ab5\u0ab6\u0ac7. Family Code: ${request.familyCode}. - \u0a9c\u0a97\u0acb\u0aa6\u0aa3\u0abe \u0aaa\u0ab0\u0abf\u0ab5\u0abe\u0ab0`;
  return `https://wa.me/91${request.mobileNumber}?text=${encodeURIComponent(text)}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const statusClass: Record<string, string> = {
  CREATED: 'bg-amber-50 text-amber-700 border-amber-100',
  SENT: 'bg-blue-50 text-blue-700 border-blue-100',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ManageOtpRequests: React.FC = () => {
  const [requests, setRequests] = useState<OtpRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | number | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await ApiService.getOtpRequests());
    } catch (err: any) {
      setError(err?.message || 'Failed to load OTP requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const runAction = async (id: string | number, action: () => Promise<OtpRequestRecord>) => {
    setActionId(id);
    setError('');
    try {
      const updated = await action();
      setRequests(prev => prev.map(request => String(request.id) === String(id) ? { ...request, ...updated } : request));
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter(request => [request.firstName, request.lastName, request.villageName, request.mobileNumber, request.familyCode, request.status].some(value => String(value || '').toLowerCase().includes(needle)));
  }, [requests, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">OTP Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Review and send registration OTP requests.</p>
        </div>
        <button onClick={loadRequests} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search OTP requests" />
      </div>

      {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? <div className="flex items-center justify-center gap-3 p-12 text-slate-500"><Loader2 className="animate-spin" size={22} /> Loading OTP requests...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Village</th><th className="px-4 py-3">Mobile Number</th><th className="px-4 py-3">Family Code</th><th className="px-4 py-3">OTP Status</th><th className="px-4 py-3">Requested At</th><th className="px-4 py-3">Expires At</th><th className="px-4 py-3">Sent At</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(request => (
                  <tr key={request.id} className="align-top">
                    <td className="px-4 py-4 font-bold text-slate-800">{[request.firstName, request.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-4 py-4 text-slate-600">{request.villageName || '-'}</td>
                    <td className="px-4 py-4 font-bold text-slate-700">{request.mobileNumber}</td>
                    <td className="px-4 py-4 font-black text-indigo-700">{request.familyCode}</td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusClass[request.status] || statusClass.CREATED}`}>{request.status}</span></td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(request.expiresAt)}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(request.sentAt)}</td>
                    <td className="px-4 py-4"><div className="flex justify-end gap-2">
                      <a href={buildWhatsappUrl(request)} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50" title="Open WhatsApp"><ExternalLink size={16} /></a>
                      <button disabled={actionId === request.id || request.status === 'EXPIRED'} onClick={() => runAction(request.id, () => ApiService.markOtpRequestSent(request.id))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 disabled:opacity-40" title="Mark as Sent"><CheckCircle size={16} /></button>
                      <button disabled={actionId === request.id} onClick={() => runAction(request.id, () => ApiService.resendOtpRequest(request.id))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40" title="Resend OTP"><RefreshCw size={16} /></button>
                      <button disabled={actionId === request.id || request.status === 'EXPIRED'} onClick={() => runAction(request.id, () => ApiService.expireOtpRequest(request.id))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 disabled:opacity-40" title="Expire Now"><TimerOff size={16} /></button>
                    </div></td>
                  </tr>
                ))}
                {!filteredRequests.length && <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-500">No OTP requests found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOtpRequests;