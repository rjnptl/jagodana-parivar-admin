import React, { useState, useMemo } from 'react';
import { Member, BloodGroup } from '../../types';
import { Droplet, Search, Save, X, Edit2, Filter, AlertCircle } from 'lucide-react';

interface ManageBloodGroupsProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const ManageBloodGroups: React.FC<ManageBloodGroupsProps> = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<BloodGroup>(BloodGroup.UNKNOWN);

  // Calculate Stats
  const stats = useMemo(() => {
    const counts = members.reduce((acc, member) => {
      acc[member.bloodGroup] = (acc[member.bloodGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  }, [members]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGroup === 'All' || m.bloodGroup === filterGroup;
    return matchesSearch && matchesFilter;
  });

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setEditValue(member.bloodGroup);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(BloodGroup.UNKNOWN);
  };

  const saveEdit = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, bloodGroup: editValue } : m));
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blood Group Registry</h2>
          <p className="text-slate-500">Maintain accurate blood group records for emergency assistance.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.values(BloodGroup).filter(bg => bg !== BloodGroup.UNKNOWN).map(bg => (
          <div key={bg} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex flex-col items-center justify-center hover:bg-red-50 transition-colors">
            <span className="text-red-500 font-bold text-lg">{bg}</span>
            <span className="text-slate-500 text-xs">{stats[bg] || 0} Donors</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search member name..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-48">
             <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
             <select 
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm appearance-none bg-white"
               value={filterGroup}
               onChange={(e) => setFilterGroup(e.target.value)}
             >
               <option value="All">All Groups</option>
               {Object.values(BloodGroup).map(bg => (
                 <option key={bg} value={bg}>{bg}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">
                    {member.fullName}
                    {member.bloodGroup === BloodGroup.UNKNOWN && (
                      <span className="ml-2 inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} className="mr-1"/> Missing Info
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{member.mobile}</td>
                  <td className="p-4">
                    {editingId === member.id ? (
                      <select 
                        className="p-1 border border-red-200 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value as BloodGroup)}
                        autoFocus
                      >
                        {Object.values(BloodGroup).map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold ${
                        member.bloodGroup === BloodGroup.UNKNOWN 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        <Droplet size={12} className={member.bloodGroup === BloodGroup.UNKNOWN ? 'hidden' : 'fill-current'} />
                        {member.bloodGroup}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === member.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveEdit(member.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                          <Save size={16} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No members found matching your search.
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

export default ManageBloodGroups;