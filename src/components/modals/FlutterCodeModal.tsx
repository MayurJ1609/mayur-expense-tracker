import React, { useState } from 'react';
import { FLUTTER_CODEBASE, FlutterFile } from '../../data/flutterSourceCode';
import { X, Copy, Check, Download, Code2, FileCode, FolderGit2 } from 'lucide-react';
import JSZip from 'jszip';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<FlutterCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const activeFile = FLUTTER_CODEBASE[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all project files
      FLUTTER_CODEBASE.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add a README
      zip.file(
        'README.md',
        `# SpendTrack SMS - Flutter Android App

This is the complete Flutter Android codebase for the SMS Expense Tracker.

## Features
- Reads bank SMS using Android telephony APIs
- Regex-based parser for Amount, Bank name, and Credit Card vs Debit Card
- Auto-categorization of expenses with editable category support
- Material 3 4-screen layout matching Google Stitch specifications

## How to run
1. Open this folder in VS Code or Android Studio
2. Run \`flutter pub get\`
3. Connect an Android phone or emulator with SMS support
4. Run \`flutter run\`
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spendtrack_sms_flutter.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Flutter Android Source Code</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Dart · Material 3
                </span>
              </div>
              <p className="text-xs text-slate-400">Complete native Flutter codebase ready for Android Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'Zipping...' : 'Download Project (.zip)'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Split: File Tree on left, Code on right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
              Flutter Project Files
            </div>
            <div className="space-y-1">
              {FLUTTER_CODEBASE.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                    activeFileIndex === idx
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${activeFileIndex === idx ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.filename}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Android Telephony API</span>
              <p className="leading-relaxed">
                Uses Android SMS permissions to listen to incoming SMS and batch scan previous bank notifications.
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Top Bar for Code */}
            <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <span className="text-slate-500">path:</span>
                <span className="text-indigo-300">{activeFile.path}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-2 bg-slate-900/30 text-[11px] text-slate-400 border-b border-slate-800/60">
              {activeFile.description}
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200 selection:bg-indigo-500 selection:text-white">
              <pre>
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
