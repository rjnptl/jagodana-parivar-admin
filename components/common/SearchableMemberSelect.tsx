import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { Member } from '../../types';
import { formatMemberDisplayName } from '../../services/nameFormatter';

interface SearchableMemberSelectProps {
  members: Member[];
  value: string;
  onChange: (memberId: string, member: Member | null) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  /** Shown as the selected label when no member id matches (e.g. legacy free-text values). */
  fallbackLabel?: string;
}

const memberLabel = (member: Member) => {
  const name = formatMemberDisplayName(member) || member.fullName;
  return member.familyId ? `${name} (${member.familyId})` : name;
};

// Type-ahead combobox: filters by member name AND family code.
const SearchableMemberSelect: React.FC<SearchableMemberSelectProps> = ({
  members,
  value,
  onChange,
  disabled,
  loading,
  placeholder = 'Search by name, family code or mobile...',
  fallbackLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedMember = useMemo(() => members.find(member => member.id === value) || null, [members, value]);

  const filteredMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(member => {
      const name = (formatMemberDisplayName(member) || member.fullName || '').toLowerCase();
      const familyCode = (member.familyId || '').toLowerCase();
      const mobile = (member.mobile || '').toLowerCase();
      return name.includes(needle) || familyCode.includes(needle) || mobile.includes(needle);
    });
  }, [members, query]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectMember = (member: Member) => {
    onChange(member.id, member);
    setIsOpen(false);
    setQuery('');
  };

  const clearSelection = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('', null);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(open => !open)}
        className="w-full flex items-center justify-between gap-2 p-2 border rounded bg-white text-left text-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className={selectedMember || fallbackLabel ? 'text-slate-800' : 'text-slate-400'}>
          {loading ? 'Loading members...' : selectedMember ? memberLabel(selectedMember) : (fallbackLabel || '-- Select Member --')}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selectedMember && !disabled && (
            <span onClick={clearSelection} role="button" aria-label="Clear selected member" className="p-0.5 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </span>
          )}
          {loading ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="relative border-b border-slate-100">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filteredMembers.map(member => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => selectMember(member)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${member.id === value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'}`}
                >
                  <span className="block font-medium">{formatMemberDisplayName(member) || member.fullName}</span>
                  <span className="block text-xs text-slate-400">
                    {[member.familyId, member.mobile, member.headOfHousehold ? 'HOF' : ''].filter(Boolean).join(' • ')}
                  </span>
                </button>
              </li>
            ))}
            {filteredMembers.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-slate-400">No members match this search.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableMemberSelect;
