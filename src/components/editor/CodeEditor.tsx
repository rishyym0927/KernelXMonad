'use client'
import React from 'react';
import MonacoEditor from './MonacaEditor';
import { FileItem } from '@/types/editor';

interface CodeEditorProps {
  file: FileItem | null;
  onContentChange: (content: string) => void;
}

const CodeEditor = ({ file, onContentChange }: CodeEditorProps) => {
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return 'solidity';
      case 'rs':
        return 'rust';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-panel)] text-[var(--text-muted)]">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">Select a file to start editing</p>
          <p className="text-sm mt-2">Supports Solidity, Rust, JS, TS and more</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(file.name);

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-panel)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)] pt-25">
      {/* File Tab Header */}
      <div className="flex items-center bg-[#1c1c24] border-b border-[var(--border)] px-4 py-2">
        <span className="text-white font-medium text-sm flex items-center">
          {language === 'solidity' && <span className="mr-2">⚡</span>}
          {language === 'rust' && <span className="mr-2">🦀</span>}
          {language === 'javascript' && <span className="mr-2">📜</span>}
          {language === 'typescript' && <span className="mr-2">🔷</span>}
          {file.name}
        </span>
        <div className="ml-auto text-xs text-[var(--text-muted)] italic">
          {language}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <MonacoEditor
          value={file.content}
          onChange={onContentChange}
          language={language}
          theme="vs-dark"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
