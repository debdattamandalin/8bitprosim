import React, { useRef, useEffect } from 'react';
import { AssemblyError, ParsedInstruction } from '../cpu/types';
import { Code, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface AssemblyEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  errors: AssemblyError[];
  currentPC: number;
  instructions: ParsedInstruction[];
  onClear: () => void;
}

export const AssemblyEditor: React.FC<AssemblyEditorProps> = ({
  code,
  onChange,
  errors,
  currentPC,
  instructions,
  onClear,
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code.split('\n');

  // Synchronize scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Find the source line corresponding to the current PC
  const activeLineIndex =
    currentPC >= 0 && currentPC < instructions.length
      ? instructions[currentPC].lineIndex
      : -1;

  // Map of line errors (1-based line number -> message)
  const errorMap = new Map<number, string>();
  errors.forEach((err) => errorMap.set(err.line, err.message));

  useEffect(() => {
    handleScroll();
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Assembly Editor
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-3">
          {errors.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.length} error{errors.length > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <CheckCircle className="w-3 h-3" />
              <span>Syntax Valid</span>
            </div>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear editor code"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Side-by-Side Line Indicators & Textarea */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers and Active / Error badges */}
        <div
          ref={lineNumbersRef}
          className="w-14 bg-slate-950/70 border-r border-slate-800/80 select-none py-3 text-right pr-3 overflow-hidden text-slate-600 font-mono"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = idx === activeLineIndex;
            const hasErr = errorMap.has(lineNum);

            return (
              <div
                key={idx}
                className={`h-5 leading-5 flex items-center justify-end gap-1 ${
                  isCurrent
                    ? 'text-cyan-400 font-bold bg-cyan-500/20 -mr-3 pr-3 border-r-2 border-cyan-400'
                    : hasErr
                    ? 'text-rose-400 font-bold bg-rose-500/20 -mr-3 pr-3 border-r-2 border-rose-400'
                    : ''
                }`}
              >
                {hasErr && <span className="text-[9px] text-rose-400">●</span>}
                {isCurrent && <span className="text-[9px] text-cyan-400">▶</span>}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea Input */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            className="w-full h-full resize-none bg-transparent p-3 leading-5 text-slate-200 outline-none font-mono focus:ring-0 border-none selection:bg-cyan-500/30 whitespace-pre overflow-auto"
            placeholder="; Enter 8-bit assembly code here..."
          />
        </div>
      </div>

      {/* Error notification bar at bottom of editor */}
      {errors.length > 0 && (
        <div className="bg-rose-950/60 border-t border-rose-800/60 px-4 py-2 text-xs font-mono text-rose-300 max-h-24 overflow-y-auto">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-1.5 py-0.5">
              <span className="font-semibold text-rose-400 shrink-0">Line {err.line}:</span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
