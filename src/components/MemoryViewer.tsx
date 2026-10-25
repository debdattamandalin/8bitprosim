import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toHex8, toBin8 } from '../cpu/alu';
import { Database, Search } from 'lucide-react';

interface MemoryViewerProps {
  memory: Uint8Array;
  lastAccess?: { address: number; type: 'READ' | 'WRITE' };
  onModifyByte?: (address: number, val: number) => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({
  memory,
  lastAccess,
  onModifyByte,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNonZero, setFilterNonZero] = useState(false);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);

  const targetAddress = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    if (q.startsWith('0x') || q.startsWith('0X')) {
      const val = parseInt(q, 16);
      return !isNaN(val) && val >= 0 && val < 256 ? val : null;
    }
    const val = parseInt(q, 10);
    return !isNaN(val) && val >= 0 && val < 256 ? val : null;
  }, [searchQuery]);

  // Auto-scroll to last modified or accessed address
  useEffect(() => {
    if (lastAccess && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [lastAccess?.address]);

  const handleStartEdit = (addr: number, currentVal: number) => {
    setEditingAddress(addr);
    setEditValue(currentVal.toString());
  };

  const handleSaveEdit = (addr: number) => {
    if (onModifyByte) {
      const parsed = parseInt(editValue, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
        onModifyByte(addr, parsed);
      }
    }
    setEditingAddress(null);
  };

  // Addresses to show
  const addresses = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 256; i++) {
      if (filterNonZero && memory[i] === 0 && lastAccess?.address !== i && targetAddress !== i) {
        continue;
      }
      arr.push(i);
    }
    return arr;
  }, [filterNonZero, memory, lastAccess, targetAddress]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Memory Viewer
          </span>
          <span className="text-[10px] text-slate-500 font-mono">(256 B)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle to show non-zero / active memory */}
          <button
            onClick={() => setFilterNonZero(!filterNonZero)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
              filterNonZero
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Filter to show non-zero and recently modified memory cells"
          >
            {filterNonZero ? 'Showing Non-Zero' : 'Show All'}
          </button>

          {/* Address Search */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. 50)..."
              className="pl-6 pr-2 py-0.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 w-32"
            />
          </div>
        </div>
      </div>

      {/* Memory Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-slate-950/90 sticky top-0 text-[10px] uppercase text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="py-1.5 px-3 w-16">Addr</th>
              <th className="py-1.5 px-3 w-16">Hex</th>
              <th className="py-1.5 px-3 w-16">Dec</th>
              <th className="py-1.5 px-3">Binary</th>
              <th className="py-1.5 px-3 text-right">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {addresses.map((addr) => {
              const val = memory[addr];
              const isSearched = targetAddress === addr;
              const isLastAccess = lastAccess?.address === addr;
              const accessType = isLastAccess ? lastAccess.type : null;
              const isEditing = editingAddress === addr;

              return (
                <tr
                  key={addr}
                  ref={isLastAccess ? activeRowRef : null}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isLastAccess && accessType === 'WRITE'
                      ? 'bg-slate-800/90 font-medium'
                      : isSearched
                      ? 'bg-slate-800'
                      : isLastAccess && accessType === 'READ'
                      ? 'bg-slate-850'
                      : val !== 0
                      ? 'bg-slate-900 font-medium text-slate-100'
                      : ''
                  }`}
                >
                  <td className="py-1 px-3 text-slate-500 font-mono">
                    {addr} <span className="text-[10px] text-slate-600">({toHex8(addr)})</span>
                  </td>
                  <td className="py-1 px-3 font-semibold text-slate-200">{toHex8(val)}</td>
                  <td
                    className="py-1 px-3 text-slate-300 cursor-pointer group"
                    onClick={() => handleStartEdit(addr, val)}
                    title="Click to edit value"
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValue}
                        min="0"
                        max="255"
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(addr)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(addr);
                          if (e.key === 'Escape') setEditingAddress(null);
                        }}
                        className="w-14 px-1 py-0.2 bg-slate-950 border border-slate-500 text-xs rounded text-white font-mono"
                      />
                    ) : (
                      <span className={`group-hover:underline ${val !== 0 ? 'text-white font-bold' : ''}`}>
                        {val}
                      </span>
                    )}
                  </td>
                  <td className="py-1 px-3 text-[11px] text-slate-400">{toBin8(val)}</td>
                  <td className="py-1 px-3 text-right">
                    {accessType === 'WRITE' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-700 text-white border border-slate-600">
                        STORED
                      </span>
                    )}
                    {accessType === 'READ' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        READ
                      </span>
                    )}
                    {!accessType && val !== 0 && (
                      <span className="text-[10px] text-slate-400">DATA</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
