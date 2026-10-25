import React, { useState, useMemo } from 'react';
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
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Memory Viewer
          </span>
          <span className="text-[10px] text-slate-500 font-mono">(256 B)</span>
        </div>

        {/* Address Search */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 absolute left-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search addr..."
            className="pl-6 pr-2 py-0.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 w-36"
          />
        </div>
      </div>

      {/* Memory Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-slate-950/80 sticky top-0 text-[10px] uppercase text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="py-1.5 px-3 w-16">Addr</th>
              <th className="py-1.5 px-3 w-16">Hex</th>
              <th className="py-1.5 px-3 w-16">Dec</th>
              <th className="py-1.5 px-3">Binary</th>
              <th className="py-1.5 px-3 text-right">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {Array.from(memory).map((val, addr) => {
              const isSearched = targetAddress === addr;
              const isLastAccess = lastAccess?.address === addr;
              const accessType = isLastAccess ? lastAccess.type : null;
              const isEditing = editingAddress === addr;

              return (
                <tr
                  key={addr}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSearched
                      ? 'bg-slate-800'
                      : isLastAccess && accessType === 'WRITE'
                      ? 'bg-slate-800/80'
                      : isLastAccess && accessType === 'READ'
                      ? 'bg-slate-850'
                      : val !== 0
                      ? 'bg-slate-900'
                      : ''
                  }`}
                >
                  <td className="py-1 px-3 text-slate-500">{toHex8(addr)}</td>
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
                      <span className="group-hover:underline">{val}</span>
                    )}
                  </td>
                  <td className="py-1 px-3 text-[11px] text-slate-400">{toBin8(val)}</td>
                  <td className="py-1 px-3 text-right">
                    {accessType === 'WRITE' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        WRITE
                      </span>
                    )}
                    {accessType === 'READ' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        READ
                      </span>
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
