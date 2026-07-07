import React, { useState, useMemo } from 'react';
import { Member, Village, Sponsor } from '../../types';
import { Users, Building2, BarChart2, IndianRupee, HeartHandshake } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import logo from '../../assets/jagodanaparivar.png';

interface AdminDashboardProps {
  members: Member[];
  villages: Village[];
  sponsors: Sponsor[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ members, villages, sponsors }) => {
  // Visual Report State
  const [selectedVillageId, setSelectedVillageId] = useState<string>('All');
  const [reportType, setReportType] = useState<'families' | 'members'>('families');

  // Logic for Totals (Global - Across All Villages)
  const totalFamilies = useMemo(() => {
    return members.filter(m => m.headOfHousehold).length;
  }, [members]);

  const totalMembers = members.length;
  const maleCount = useMemo(() => members.filter(member => member.gender === 'Male').length, [members]);
  const femaleCount = useMemo(() => members.filter(member => member.gender === 'Female').length, [members]);

  // Logic for Visual Report Data (Villages)
  const chartData = useMemo(() => {
    let villagesToProcess = villages;
    
    // Filter by selected village if not 'All'
    if (selectedVillageId !== 'All') {
      villagesToProcess = villages.filter(v => v.id === selectedVillageId);
    }

    const data = villagesToProcess.map(v => {
      const villageMembers = members.filter(m => m.villageId === v.id);
      let count = 0;
      if (reportType === 'families') {
        count = villageMembers.filter(m => m.headOfHousehold).length;
      } else {
        count = villageMembers.length;
      }
      return {
        name: v.nameGujarati || v.name,
        count: count
      };
    });

    // If viewing 'All', sort by count descending for better visualization
    // If viewing single village, just return the data
    if (selectedVillageId === 'All') {
      return data.filter(d => d.count > 0).sort((a, b) => b.count - a.count);
    }
    
    return data;
  }, [members, villages, selectedVillageId, reportType]);

  // Logic for Sponsor Analytics
  const sponsorStats = useMemo(() => {
    const cleanAmount = (value: string): number => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    };

    const totalAmount = sponsors.reduce((acc, curr) => acc + cleanAmount(curr.amount), 0);
    const uniqueSponsors = new Set(sponsors.map(s => s.sponsorMemberId || s.sponsorName)).size;

    // Group amounts by sponsor name
    const groupedData = sponsors.reduce((acc, curr) => {
      const amt: number = cleanAmount(curr.amount);
      const sponsorKey = curr.sponsorName || 'Unknown';
      const current: number = acc[sponsorKey] || 0;
      acc[sponsorKey] = current + amt;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(groupedData)
      .map(([name, amount]) => ({ name, amount: Number(amount) }))
      .sort((a, b) => b.amount - a.amount);

    return { totalAmount, uniqueSponsors, chartData };
  }, [sponsors]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="" className="brand-logo h-14 w-14" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Jagodana Parivar</p>
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <p className="text-slate-500">Overview of community demographics and family statistics.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Global Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
           <div className="p-3 rounded-full bg-indigo-100 text-indigo-600"><Building2 size={24} /></div>
           <div>
             <p className="text-slate-500 text-sm font-medium">Total Families (All Villages)</p>
             <h3 className="text-2xl font-bold text-slate-800">{totalFamilies}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
           <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Users size={24} /></div>
           <div>
             <p className="text-slate-500 text-sm font-medium">Total Members (All Villages)</p>
             <h3 className="text-2xl font-bold text-slate-800">{totalMembers}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
           <div className="p-3 rounded-full bg-sky-100 text-sky-600"><Users size={24} /></div>
           <div>
             <p className="text-slate-500 text-sm font-medium">Male Members</p>
             <h3 className="text-2xl font-bold text-slate-800">{maleCount}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
           <div className="p-3 rounded-full bg-pink-100 text-pink-600"><Users size={24} /></div>
           <div>
             <p className="text-slate-500 text-sm font-medium">Female Members</p>
             <h3 className="text-2xl font-bold text-slate-800">{femaleCount}</h3>
           </div>
        </div>
      </div>

      {/* Visual Report Section (Villages) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-indigo-600" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Visual Report</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
            {/* Village Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Select Village:</label>
              <select 
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(e.target.value)}
              >
                <option value="All">All Villages</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.nameGujarati || v.name}</option>
                ))}
              </select>
            </div>

            {/* Radio Buttons */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="reportType" 
                  value="families"
                  checked={reportType === 'families'}
                  onChange={() => setReportType('families')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className={`text-sm font-medium ${reportType === 'families' ? 'text-indigo-700' : 'text-slate-600 group-hover:text-indigo-600'}`}>Total Families</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="reportType" 
                  value="members"
                  checked={reportType === 'members'}
                  onChange={() => setReportType('members')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className={`text-sm font-medium ${reportType === 'members' ? 'text-indigo-700' : 'text-slate-600 group-hover:text-indigo-600'}`}>Total Members</span>
              </label>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-96 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar 
                  dataKey="count" 
                  fill={reportType === 'families' ? '#28166f' : '#d4146f'}
                  radius={[4, 4, 0, 0]} 
                  barSize={selectedVillageId === 'All' ? undefined : 80}
                  name={reportType === 'families' ? 'Families' : 'Members'}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Building2 size={48} className="mb-2 opacity-20" />
               <p>No data available for the selected criteria</p>
             </div>
          )}
        </div>
      </div>

      {/* Sponsorship Insights Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <HeartHandshake className="text-amber-500" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Sponsorship Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-amber-100 rounded-full text-amber-600"><IndianRupee size={20} /></div>
               <span className="text-slate-600 font-medium">Total Amount Sponsored</span>
             </div>
             <p className="text-3xl font-bold text-slate-800 pl-11">{formatCurrency(sponsorStats.totalAmount)}</p>
           </div>
           
           <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><Users size={20} /></div>
               <span className="text-slate-600 font-medium">Total Active Sponsors</span>
             </div>
             <p className="text-3xl font-bold text-slate-800 pl-11">{sponsorStats.uniqueSponsors}</p>
           </div>
        </div>

        <div className="h-80 w-full">
           <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Top Contributors</h4>
           {sponsorStats.chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sponsorStats.chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                 <YAxis dataKey="name" type="category" width={140} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                 <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                 />
                 <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <p>No sponsorship data available</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
