// stores/fileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileItem } from '@/types/editor';

interface FileStore {
  files: FileItem[];
  selectedFile: FileItem | null;
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  setSelectedFile: (file: FileItem | null) => void;
  createFile: (name: string, language?: string) => void;
  addFile: (file: FileItem) => void;
  updateFile: (file: FileItem) => void;
  deleteFile: (id: string) => void;
  
  // Utility functions
  getFileById: (id: string) => FileItem | undefined;
  getFilesByLanguage: (language: string) => FileItem[];
}

// Helper function to generate unique ID
const generateId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to determine language from file extension
const getLanguageFromExtension = (extension: string): string => {
  switch (extension.toLowerCase()) {
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
    case 'py':
      return 'python';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    default:
      return 'text';
  }
};

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      selectedFile: null,

      setFiles: (files: FileItem[]) => {
        set({ files });
      },

      setSelectedFile: (file: FileItem | null) => {
        set({ selectedFile: file });
      },

      createFile: (name: string, language?: string) => {
        const extension = name.split('.').pop() || '';
        const detectedLanguage = language || getLanguageFromExtension(extension);
        
        const newFile: FileItem = {
          id: generateId(),
          name,
          content: '',
          language: detectedLanguage,
          extension,
          type: 'file',
          size: 0,
          created: new Date(),
          modified: new Date()
        };

        set(state => ({
          files: [...state.files, newFile],
          selectedFile: newFile // Auto-select the newly created file
        }));
      },

      addFile: (file: FileItem) => {
        const { files } = get();
        
        // Check if file with same ID already exists
        const existingFileIndex = files.findIndex(f => f.id === file.id);
        
        if (existingFileIndex >= 0) {
          // Update existing file
          const updatedFiles = [...files];
          updatedFiles[existingFileIndex] = {
            ...file,
            modified: new Date()
          };
          
          set({
            files: updatedFiles,
            selectedFile: updatedFiles[existingFileIndex]
          });
        } else {
          // Add new file
          const extension = file.name.split('.').pop() || '';
          const fileToAdd: FileItem = {
            ...file,
            id: file.id || generateId(),
            extension: file.extension || extension,
            language: file.language || getLanguageFromExtension(extension),
            size: file.content?.length || 0,
            created: file.created || new Date(),
            modified: new Date()
          };

          set(state => ({
            files: [...state.files, fileToAdd]
          }));
        }
      },

      updateFile: (updatedFile: FileItem) => {
        set(state => {
          const updatedFiles = state.files.map(file => 
            file.id === updatedFile.id 
              ? { 
                  ...updatedFile, 
                  modified: new Date(),
                  size: updatedFile.content?.length || 0
                }
              : file
          );

          return {
            files: updatedFiles,
            selectedFile: state.selectedFile?.id === updatedFile.id 
              ? { ...updatedFile, modified: new Date() }
              : state.selectedFile
          };
        });
      },

      deleteFile: (id: string) => {
        set(state => {
          const filteredFiles = state.files.filter(file => file.id !== id);
          const wasSelectedFile = state.selectedFile?.id === id;
          
          return {
            files: filteredFiles,
            selectedFile: wasSelectedFile 
              ? (filteredFiles.length > 0 ? filteredFiles[0] : null)
              : state.selectedFile
          };
        });
      },

      getFileById: (id: string) => {
        return get().files.find(file => file.id === id);
      },

      getFilesByLanguage: (language: string) => {
        return get().files.filter(file => file.language === language);
      }
    }),
    {
      name: 'file-store',
      // Only persist essential data, not temporary states
      partialize: (state) => ({
        files: state.files,
        selectedFile: state.selectedFile
      }),
    }
  )
);