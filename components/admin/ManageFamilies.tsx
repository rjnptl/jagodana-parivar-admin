
import React, { useState, useMemo } from 'react';
import { Member, Village } from '../../types';
import { Search, Filter, Users, X, Phone, User, Home, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { formatMemberDisplayName, getJagodanaSurname, getMemberInitial } from '../../services/nameFormatter';

interface ManageFamiliesProps {
  members: Member[];
  villages: Village[];
}

const ManageFamilies: React.FC<ManageFamiliesProps> = ({ members, villages }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [viewFamilyId, setViewFamilyId] = useState<string | null>(null);
  const surname = getJagodanaSurname();

  // Group members into families by familyId
  const families = useMemo(() => {
    const familyMap = new Map<string, { hof: Member; memberCount: number; villageName: string }>();
    
    // First pass: identify HOFs and initialize entries
    members.forEach(m => {
      if (m.headOfHousehold) {
        const village = villages.find(v => v.id === m.villageId);
        familyMap.set(m.familyId, { 
          hof: m, 
          memberCount: 0, 
          villageName: village?.nameGujarati || village?.name || 'Unknown' 
        });
      }
    });

    // Handle cases where a family might not have an HOF designated (fallback)
    members.forEach(m => {
      if (!familyMap.has(m.familyId)) {
        const village = villages.find(v => v.id === m.villageId);
        familyMap.set(m.familyId, { 
          hof: { ...m, fullName: m.fullName + ' (Auto-HOF)' }, 
          memberCount: 0, 
          villageName: village?.nameGujarati || village?.name || 'Unknown' 
        });
      }
      
      const entry = familyMap.get(m.familyId)!;
      entry.memberCount += 1;
    });

    return Array.from(familyMap.entries())
      .filter(([id, data]) => {
        const normalizedSearch = searchTerm.toLowerCase();
        const matchesSearch = formatMemberDisplayName(data.hof).toLowerCase().includes(normalizedSearch) ||
                             surname.toLowerCase().includes(normalizedSearch) ||
                             id.toLowerCase().includes(normalizedSearch);
        const matchesVillage = selectedVillageId === 'All' || data.hof.villageId === selectedVillageId;
        const matchesGender = selectedGender === 'All' || members.some(member => member.familyId === id && member.gender === selectedGender);
        return matchesSearch && matchesVillage && matchesGender;
      })
      .map(([id, data]) => ({ id, ...data }));
  }, [members, villages, searchTerm, selectedVillageId, selectedGender, surname]);

  const familyMembersToDisplay = viewFamilyId ? members.filter(m => m.familyId === viewFamilyId) : [];
  const hofOfDisplayedFamily = familyMembersToDisplay.find(m => m.headOfHousehold) || familyMembersToDisplay[0];
  const displayRelation = (member: Member) => {
    if (member.headOfHousehold) return 'Self';
    const relation = member.relationToHead || member.relationWithHead;
    return relation && relation !== 'Member' ? relation : 'Relation not set';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Family Registry</h2>
          <p className="text-slate-500">View and manage registered families across all villages.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by HOF name or Family ID..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm"
            value={selectedVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
          >
            <option value="All">All Villages</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.nameGujarati || v.name}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-48">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as 'All' | 'Male' | 'Female')}
          >
            <option value="All">All Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Family Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Family ID</th>
                <th className="p-4">Head of Family</th>
                <th className="p-4">Surname</th>
                <th className="p-4">Village</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Status</th>
                <th className="p-4">Members</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {families.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-mono text-indigo-600 font-bold">{f.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {getMemberInitial(f.hof)}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{formatMemberDisplayName(f.hof)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">{surname}</td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400"/> {f.villageName}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{f.hof.gender || 'Not Set'}</td>
                  <td className="p-4 text-sm text-slate-600">{f.hof.mobile}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${f.hof.isActiveUser ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {f.hof.isActiveUser ? 'Active Member' : 'Without Login'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {f.memberCount} Members
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setViewFamilyId(f.id)}
                      className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 ml-auto"
                    >
                      See family members <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {families.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No families found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Family Members Modal */}
      {viewFamilyId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 flex justify-between items-start text-white">
              <div>
                 <h3 className="text-2xl font-bold flex items-center gap-2">
                   <Home className="text-indigo-200" /> 
                   {hofOfDisplayedFamily ? formatMemberDisplayName(hofOfDisplayedFamily) : 'Family'}'s Family
                 </h3>
                 <p className="text-indigo-100 text-sm mt-1 flex items-center gap-4">
                   <span>Family ID: <span className="font-mono font-bold">{viewFamilyId}</span></span>
                   <span>•</span>
                   <span>{familyMembersToDisplay.length} Members total</span>
                 </p>
              </div>
              <button 
                onClick={() => setViewFamilyId(null)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              >
                 <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
               <div className="space-y-3">
                 {familyMembersToDisplay.map(member => (
                   <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${member.headOfHousehold ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                           {getMemberInitial(member)}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800 flex items-center gap-2">
                             {formatMemberDisplayName(member)}
                             {member.headOfHousehold && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">HOF</span>}
                           </h4>
                           <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1 mt-1 font-medium">
                              <span className="flex items-center gap-1"><User size={12}/> {displayRelation(member)}</span>
                              <span>�</span>
                              <span>{member.gender || 'Gender not set'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Calendar size={12}/> {member.dob || 'DOB not set'}</span>
                              <span>{member.age ? `${member.age} Years` : 'Age not set'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Phone size={12} /> {member.mobile}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
               <button 
                 onClick={() => setViewFamilyId(null)} 
                 className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold transition-colors text-sm"
               >
                 Close Detail
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFamilies;
