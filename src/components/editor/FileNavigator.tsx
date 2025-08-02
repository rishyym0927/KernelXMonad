"use client"
import type React from "react"
import { useState } from "react"
import type { FileItem } from "../../types/editor"

interface CollaborativeFile {
  id: string;
  name: string;
  content: string;
  createdBy: string;
  lastModified: number;
}

interface FileNavigatorProps {
  files: FileItem[]
  selectedFile: FileItem | null
  onFileSelect: (file: FileItem) => void
  onFileCreate: (name: string) => void
  onFileDelete: (id: string) => void
  onFileRename?: (id: string, newName: string) => void
  isCollaborative?: boolean
  collaborativeFiles?: CollaborativeFile[]
  selectedCollaborativeFileId?: string | null
  onCollaborativeFileCreate?: (name: string) => void
  onCollaborativeFileSelect?: (file: CollaborativeFile) => void
  onCollaborativeFileDelete?: (fileId: string) => void
  onCollaborativeFileRename?: (fileId: string, newName: string) => void
}

const getFileColor = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'sol':
      return 'text-indigo-400';
    case 'js':
    case 'ts':
      return 'text-amber-400';
    case 'json':
      return 'text-emerald-400';
    case 'md':
      return 'text-sky-400';
    case 'css':
      return 'text-blue-400';
    case 'html':
      return 'text-orange-400';
    case 'py':
      return 'text-yellow-400';
    default:
      return 'text-slate-400';
  }
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'sol':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
        </svg>
      );
    case 'js':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.77l-.528.067c-.507.124-.991.395-1.283.754-.855.983-.623 2.699.409 3.405.675.541 1.626.404 2.142.842.21.178.24.440.18.615-.201.673-1.175.65-1.756.364-.388-.213-.604-.513-.845-.932L9.397 17.94c.201.32.389.617.618.855.618.64 1.449.96 2.502.96.715 0 1.449-.129 2.051-.51.673-.429 1.07-1.074 1.07-1.986-.007-.617-.247-1.178-.678-1.552z"/>
        </svg>
      );
    case 'ts':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
        </svg>
      );
    case 'json':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.7 21L3.7 19L5.7 17H8.7L10.7 19L8.7 21H5.7M3 14H6L8 16L6 18H3V14M15.3 3L17.3 5L15.3 7H12.3L10.3 5L12.3 3H15.3M18 10V8H21V10H18M21 14H18V16H21V14M18 6V4H21V6H18M12 12L10 10L12 8L14 10L12 12M8 12L6 10L8 8L10 10L8 12M16 12L14 10L16 8L18 10L16 12Z"/>
        </svg>
      );
    case 'md':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.31a1.73 1.73 0 01-1.73 1.73zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.077h-2.308l-2.307 2.885-2.308-2.885H3.46v7.846h2.309zm13.846-4.5H16.23V8.077h-2.307v7.846h2.307v-3.346h3.385v3.346h2.307V8.077h-2.307v3.346z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" 
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
  }
};

const FileNavigator = ({ 
  files, 
  selectedFile, 
  onFileSelect, 
  onFileCreate, 
  onFileDelete,
  onFileRename,
  isCollaborative = false,
  collaborativeFiles = [],
  selectedCollaborativeFileId,
  onCollaborativeFileCreate,
  onCollaborativeFileSelect,
  onCollaborativeFileDelete,
  onCollaborativeFileRename
}: FileNavigatorProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      if (isCollaborative && onCollaborativeFileCreate) {
        onCollaborativeFileCreate(newFileName.trim())
      } else {
        onFileCreate(newFileName.trim())
      }
      setNewFileName("")
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, fileId: string) => {
    if (e.key === 'Enter') {
      handleRename(fileId);
    } else if (e.key === 'Escape') {
      setRenamingFileId(null);
      setRenameValue('');
    }
  };

  const startRename = (file: FileItem | CollaborativeFile) => {
    setRenamingFileId(file.id);
    setRenameValue(file.name);
  };

  const handleRename = (fileId: string) => {
    if (renameValue.trim() && renameValue.trim() !== displayFiles.find(f => f.id === fileId)?.name) {
      if (isCollaborative && onCollaborativeFileRename) {
        onCollaborativeFileRename(fileId, renameValue.trim());
      } else if (onFileRename) {
        onFileRename(fileId, renameValue.trim());
      }
    }
    setRenamingFileId(null);
    setRenameValue('');
  };

  // Use collaborative files when in collaborative mode
  const displayFiles = isCollaborative ? collaborativeFiles : files
  const selectedFileIdOrFile = isCollaborative ? selectedCollaborativeFileId : selectedFile?.id

  return (
    <div className="w-64 bg-black border-r border-slate-700/50 flex flex-col h-full pt-22">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" 
                    d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            Files
            {isCollaborative && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-900/50 text-emerald-400 text-xs rounded-full font-medium border border-emerald-500/30">
                Shared
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 hover:bg-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {/* New File Input */}
        {isCreating && (
          <div className="p-3 bg-slate-800/50 border-b border-slate-700/50">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newFileName.trim()) {
                  setIsCreating(false)
                }
              }}
              placeholder="Enter filename..."
              className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-600 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                        placeholder-slate-400 transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* File Items */}
        <div className="p-2">
          {displayFiles.map((file) => (
            <div
              key={file.id}
              className={`group relative flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 mb-1 ${
                selectedFileIdOrFile === file.id
                  ? "bg-indigo-900/50 text-indigo-200 border border-indigo-500/50"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
              }`}
              onClick={() => {
                if (renamingFileId !== file.id) {
                  if (isCollaborative && onCollaborativeFileSelect) {
                    onCollaborativeFileSelect(file as CollaborativeFile)
                  } else {
                    onFileSelect(file as FileItem)
                  }
                }
              }}
            >
              {/* Selection indicator */}
              {selectedFileIdOrFile === file.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
              )}

              <div className="flex items-center flex-1 min-w-0 ml-1">
                <div className={`${getFileColor(file.name)} mr-3 flex-shrink-0`}>
                  {getFileIcon(file.name)}
                </div>
                
                {renamingFileId === file.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => handleRenameKeyPress(e, file.id)}
                    onBlur={() => handleRename(file.id)}
                    className="flex-1 px-2 py-1 text-sm bg-slate-800 border border-indigo-500/50 text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    {isCollaborative && (file as CollaborativeFile).createdBy && (
                      <span className="text-xs text-slate-500 truncate">
                        by {(file as CollaborativeFile).createdBy.substr(0, 8)}...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {renamingFileId !== file.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(file)
                    }}
                    className="p-1 rounded-md transition-colors hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 mr-1"
                    title="Rename File"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" 
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isCollaborative && onCollaborativeFileDelete) {
                      onCollaborativeFileDelete(file.id)
                    } else {
                      onFileDelete(file.id)
                    }
                  }}
                  className="p-1 rounded-md transition-colors hover:bg-red-900/50 hover:text-red-400 text-slate-400"
                  title="Delete File"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayFiles.length === 0 && !isCreating && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <p className="text-sm text-slate-300 font-medium mb-1">
              {isCollaborative ? "No shared files" : "No files yet"}
            </p>
            <p className="text-xs text-slate-500">
              {isCollaborative ? "Create a file to share with your team" : "Click the + button to create your first file"}
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" 
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            {displayFiles.length} {displayFiles.length === 1 ? "file" : "files"}
            {isCollaborative && <span className="ml-1 text-emerald-600 font-medium">(shared)</span>}
          </span>
          {selectedFileIdOrFile && (
            <span className="flex items-center text-slate-600 truncate max-w-32 font-medium">
              <div className={`w-1.5 h-1.5 ${isCollaborative ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full mr-1.5`}></div>
              {displayFiles.find(f => f.id === selectedFileIdOrFile)?.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileNavigator