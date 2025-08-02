// types/editor.ts

// Define specific ABI item types
interface ABIInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: ABIInput[];
}

interface ABIOutput {
  name: string;
  type: string;
  components?: ABIOutput[];
}

interface ABIItem {
  type: 'function' | 'constructor' | 'event' | 'fallback' | 'receive' | 'error';
  name?: string;
  inputs?: ABIInput[];
  outputs?: ABIOutput[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  extension?: string;
  type: 'file' | 'folder';
  size: number;
  created?: Date;
  modified?: Date;
  path?: string;
  isReadOnly?: boolean;
  metadata?: {
    [key: string]: string | number | boolean | Date;
  };
}

export interface FolderItem extends Omit<FileItem, 'content' | 'size'> {
  type: 'folder';
  children?: FileItem[];
  isExpanded?: boolean;
}

export interface EditorState {
  files: FileItem[];
  selectedFile: FileItem | null;
  openTabs: FileItem[];
  searchQuery: string;
  isSearchVisible: boolean;
}

export interface CompilationResult {
  success: boolean;
  errors: CompilerError[];
  warnings: CompilerWarning[];
  bytecode?: string;
  abi?: ABIItem[];
  gasEstimate?: number;
}

export interface CompilerError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
}

export interface CompilerWarning {
  line: number;
  column: number;
  message: string;
  type: string;
}

export interface DeploymentResult {
  success: boolean;
  address?: string;
  transactionHash?: string;
  gasUsed?: number;
  error?: string;
}

// Language configuration
export interface LanguageConfig {
  name: string;
  extension: string;
  mimeType: string;
  highlighter: string;
  compiler?: string;
  linter?: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  solidity: {
    name: 'Solidity',
    extension: 'sol',
    mimeType: 'text/x-solidity',
    highlighter: 'solidity',
    compiler: 'solc'
  },
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    mimeType: 'text/javascript',
    highlighter: 'javascript',
    linter: 'eslint'
  },
  typescript: {
    name: 'TypeScript',
    extension: 'ts',
    mimeType: 'text/typescript',
    highlighter: 'typescript',
    compiler: 'tsc',
    linter: 'eslint'
  },
  rust: {
    name: 'Rust',
    extension: 'rs',
    mimeType: 'text/x-rust',
    highlighter: 'rust',
    compiler: 'rustc'
  },
  python: {
    name: 'Python',
    extension: 'py',
    mimeType: 'text/x-python',
    highlighter: 'python',
    linter: 'pylint'
  },
  json: {
    name: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    highlighter: 'json'
  },
  css: {
    name: 'CSS',
    extension: 'css',
    mimeType: 'text/css',
    highlighter: 'css'
  },
  html: {
    name: 'HTML',
    extension: 'html',
    mimeType: 'text/html',
    highlighter: 'html'
  },
  markdown: {
    name: 'Markdown',
    extension: 'md',
    mimeType: 'text/x-markdown',
    highlighter: 'markdown'
  }
};