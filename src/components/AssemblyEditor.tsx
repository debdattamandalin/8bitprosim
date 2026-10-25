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

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const activeLineIndex =
    currentPC >= 0 && currentPC < instructions.length
      ? instructions[currentPC].lineIndex
      : -1;

  const errorMap = new Map<number, string>();
  errors.forEach((err) => errorMap.set(err.line, err.message));

  useEffect(() => {
    handleScroll();
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Assembly Editor
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-2.5">
          {errors.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-red-300 font-mono bg-red-950/40 px-2 py-0.5 rounded border border-red-800/60">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span>{errors.length} error{errors.length > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <CheckCircle className="w-3 h-3 text-slate-500" />
              <span>Valid</span>
            </div>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear editor code"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-slate-950/60 border-r border-slate-800 select-none py-2.5 text-right pr-2.5 overflow-hidden text-slate-600 font-mono"
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
                    ? 'text-slate-100 font-semibold bg-slate-800 -mr-2.5 pr-2.5 border-r-2 border-slate-300'
                    : hasErr
                    ? 'text-red-400 font-semibold bg-red-950/30 -mr-2.5 pr-2.5 border-r-2 border-red-500'
                    : ''
                }`}
              >
                {hasErr && <span className="text-[8px] text-red-400">●</span>}
                {isCurrent && <span className="text-[8px] text-slate-300">▶</span>}
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
            className="w-full h-full resize-none bg-transparent p-2.5 leading-5 text-slate-200 outline-none font-mono focus:ring-0 border-none selection:bg-slate-700 whitespace-pre overflow-auto"
            placeholder="; Enter 8-bit assembly code here..."
          />
        </div>
      </div>

      {/* Error notification bar at bottom */}
      {errors.length > 0 && (
        <div className="bg-red-950/30 border-t border-red-900/50 px-3 py-1.5 text-xs font-mono text-red-300 max-h-24 overflow-y-auto">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-1 py-0.5">
              <span className="font-semibold text-red-400 shrink-0">Line {err.line}:</span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
