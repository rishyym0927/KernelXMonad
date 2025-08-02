// app/ide/plugins/page.tsx
'use client'
import React, { useState, useCallback } from 'react'
import FileNavigator from '@/components/editor/FileNavigator'
import PluginManager from '@/components/plugins/PluginManager'
import { useFileStore } from '@/stores/fileStore'
import type { FileItem } from '@/types/editor'

export default function PluginsPage() {
  const {
    files,
    selectedFile,
    setSelectedFile,
    createFile,
    deleteFile,
    updateFile,
    addFile
  } = useFileStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<string>('')

  // Handle file selection - ensure it's synchronized across pages
  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file);
  }, [setSelectedFile]);

  // Handle file creation with proper extension detection
  const handleFileCreate = useCallback((name: string) => {
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const language = getLanguageFromExtension(extension);
    
    createFile(name, language);
  }, [createFile]);

  // Handle adding files from plugins
  const handleAddFile = useCallback((file: FileItem) => {
    // Ensure the file has proper extension and language detection
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const language = file.language || getLanguageFromExtension(extension);
    
    const fileWithExtension: FileItem = {
      ...file,
      language,
      extension,
      size: file.content?.length || 0
    };
    
    addFile(fileWithExtension);
    
    // Auto-select the newly added file
    setSelectedFile(fileWithExtension);
  }, [addFile, setSelectedFile]);

  // Handle file updates from plugins
  const handleFileUpdate = useCallback((file: FileItem) => {
    const updatedFile: FileItem = {
      ...file,
      size: file.content?.length || 0
    };
    
    updateFile(updatedFile);
    
    // If this is the currently selected file, update the selection
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFile);
    }
  }, [updateFile, selectedFile, setSelectedFile]);

  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={deleteFile}
      />
      
     <div className="flex-1 bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900/20 pt-20">
      {selectedFile ? (
        <div className="p-8 h-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              {selectedFile.name}
            </h2>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Language: {selectedFile.language || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Size: {selectedFile.size || 0} bytes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 h-[calc(100%-140px)] overflow-auto shadow-2xl">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {selectedFile.content || '// Empty file - start coding!'}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Plugin to Begin</h3>
            <p className="text-sm text-gray-500">Choose a plugin from the sidebar to get started</p>
          </div>
        </div>
      )}
    </div>
      
      <PluginManager
        selectedFile={selectedFile}
        files={files}
        onFileUpdate={handleFileUpdate}
        onAddFile={handleAddFile}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        generatingType={generatingType}
        setGeneratingType={setGeneratingType}
      />
    </div>
  )
}

// Helper function to determine language from file extension
function getLanguageFromExtension(extension: string): string {
  switch (extension) {
    case 'sol':
      return 'solidity';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'rs':
      return 'rust';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    default:
      return 'text';
  }
}