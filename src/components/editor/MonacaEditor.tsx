import React, { useRef, useEffect, useState, useCallback } from "react";
import { Code2,X } from "lucide-react";

interface SolidityEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}

interface SolidityEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}



// Solidity keywords and types
const SOLIDITY_KEYWORDS = [
  "pragma",
  "solidity",
  "contract",
  "interface",
  "library",
  "abstract",
  "function",
  "modifier",
  "event",
  "struct",
  "enum",
  "mapping",
  "public",
  "private",
  "internal",
  "external",
  "pure",
  "view",
  "payable",
  "constant",
  "immutable",
  "override",
  "virtual",
  "returns",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "break",
  "continue",
  "try",
  "catch",
  "throw",
  "revert",
  "require",
  "assert",
  "new",
  "delete",
  "this",
  "super",
  "using",
  "is",
  "as",
  "import",
  "from",
  "constructor",
  "fallback",
  "receive",
  "emit",
  "indexed",
  "anonymous",
  "assembly",
  "memory",
  "storage",
  "calldata",
  "true",
  "false",
  "null",
  "undefined",
];

const SOLIDITY_TYPES = [
  "uint",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256",
  "int",
  "int8",
  "int16",
  "int32",
  "int64",
  "int128",
  "int256",
  "bytes",
  "bytes1",
  "bytes2",
  "bytes4",
  "bytes8",
  "bytes16",
  "bytes32",
  "string",
  "bool",
  "address",
  "payable",
];

const COMMON_FUNCTIONS = [
  'require(condition, "message")',
  "assert(condition)",
  'revert("message")',
  "msg.sender",
  "msg.value",
  "msg.data",
  "block.timestamp",
  "block.number",
  "block.difficulty",
  "tx.origin",
  "tx.gasprice",
  "gasleft()",
  "keccak256(abi.encodePacked())",
  "sha256()",
  "ecrecover()",
  "address(this).balance",
  "selfdestruct(address)",
  "abi.encode()",
  "abi.encodePacked()",
  "abi.decode()",
  "SafeMath.add()",
  "SafeMath.sub()",
  "SafeMath.mul()",
  "SafeMath.div()",
];

const CONTRACT_TEMPLATES = [
  {
    name: "Basic Contract",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}`,
  },
  {
    name: "ERC20 Token",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ERC20Token is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _totalSupply * 10**_decimals;
        _balances[msg.sender] = _totalSupply;
    }
}`,
  },
];

export const SolidityEditor = ({
  value = "",
  onChange,
}: SolidityEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [code, setCode] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const minimapRef = useRef<HTMLDivElement | null>(null);
  const [selectedText, setSelectedText] = useState("");
const [showSnipButton, setShowSnipButton] = useState(false);
const [snipButtonPosition, setSnipButtonPosition] = useState({ x: 0, y: 0 });
const [showCodeSnippet, setShowCodeSnippet] = useState(false);
const [selectedLibrary, setSelectedLibrary] = useState<'ethers' | 'web3' | 'wagmi' | null>(null);


const generateCodeSnippet = useCallback((functionSignature: string, library: 'ethers' | 'web3' | 'wagmi') => {
  // Parse function name and parameters
  const functionMatch = functionSignature.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  const functionName = functionMatch ? functionMatch[1] : 'unknownFunction';
  const params = functionMatch ? functionMatch[2] : '';
  
  // Check if it's a view function
  const isView = functionSignature.includes('view') || functionSignature.includes('pure');
  const isPayable = functionSignature.includes('payable');
  
  const paramArray = params ? params.split(',').map(p => p.trim().split(' ')[1] || 'param').filter(Boolean) : [];
  const paramValues = paramArray.map((_, i) => `param${i + 1}`).join(', ');

  switch (library) {
    case 'ethers':
      return `// Ethers.js v6 Integration
import { ethers } from 'ethers';

// Connect to provider and contract
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const signer = provider.getSigner();
const contract = new ethers.Contract('CONTRACT_ADDRESS', abi, signer);

${isView ? 
`// Call view function
const result = await contract.${functionName}(${paramValues});
console.log('Result:', result);` :
`// Send transaction
const tx = await contract.${functionName}(${paramValues}${isPayable ? ', { value: ethers.parseEther("0.1") }' : ''});
const receipt = await tx.wait();
console.log('Transaction hash:', receipt.hash);`}`;

    case 'web3':
      return `// Web3.js Integration
import Web3 from 'web3';

// Connect to Web3
const web3 = new Web3('YOUR_RPC_URL');
const contract = new web3.eth.Contract(abi, 'CONTRACT_ADDRESS');

${isView ?
`// Call view function
const result = await contract.methods.${functionName}(${paramValues}).call();
console.log('Result:', result);` :
`// Send transaction
const accounts = await web3.eth.getAccounts();
const tx = await contract.methods.${functionName}(${paramValues}).send({
  from: accounts[0]${isPayable ? ',\n  value: web3.utils.toWei("0.1", "ether")' : ''}
});
console.log('Transaction hash:', tx.transactionHash);`}`;

    case 'wagmi':
      return `// Wagmi React Hook Integration
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

${isView ?
`// Read contract data
const { data, isError, isLoading } = useContractRead({
  address: 'CONTRACT_ADDRESS',
  abi: contractAbi,
  functionName: '${functionName}',
  args: [${paramValues}],
});` :
`// Write to contract
const { config } = usePrepareContractWrite({
  address: 'CONTRACT_ADDRESS',
  abi: contractAbi,
  functionName: '${functionName}',
  args: [${paramValues}],${isPayable ? '\n  value: parseEther("0.1"),' : ''}
});

const { data, isLoading, isSuccess, write } = useContractWrite(config);

// In your component
<button disabled={!write} onClick={() => write?.()}>
  ${functionName}
</button>`}`;

    default:
      return '';
  }
}, []);

const handleMouseUp = useCallback((e: MouseEvent) => {
  if (!textareaRef.current) return;
  
  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  if (start === end) {
    setShowSnipButton(false);
    return;
  }

  const selectedText = textarea.value.substring(start, end).trim();
  
  if (selectedText.length < 5 || !selectedText.includes('function')) {
    setShowSnipButton(false);
    return;
  }

  // Get mouse position relative to viewport
  setSnipButtonPosition({
    x: e.clientX + 10, // Small offset to avoid covering the cursor
    y: e.clientY - 40
  });
  
  setSelectedText(selectedText);
  setShowSnipButton(true);
}, []);


const handleTextSelection = useCallback(() => {
  if (!textareaRef.current) return;
  
  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  if (start === end) {
    setShowSnipButton(false);
    return;
  }

  const selectedText = textarea.value.substring(start, end).trim();
  
  if (selectedText.length < 5) {
    setShowSnipButton(false);
    return;
  }

  // Check if selected text contains a function
  if (selectedText.includes('function')) {
    setSelectedText(selectedText);
    setShowSnipButton(true);
  } else {
    setShowSnipButton(false);
  }
}, []);

useEffect(() => {
  const textarea = textareaRef.current;
  if (textarea) {
    // Use document to capture mouse events globally
    document.addEventListener('mouseup', handleMouseUp);
    textarea.addEventListener('keyup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      textarea.removeEventListener('keyup', handleTextSelection);
    };
  }
}, [handleTextSelection, handleMouseUp]);


const highlightSolidity = useCallback((code: string) => {
  let highlighted = code;

  // Escape HTML first
  highlighted = highlighted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments (single line and multi-line)
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    '<span style="color: #6A9955; font-style: italic;">$1</span>'
  );
  highlighted = highlighted.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span style="color: #6A9955; font-style: italic;">$1</span>'
  );

  // Strings (double and single quotes)
  highlighted = highlighted.replace(
    /("(?:[^"\\]|\\.)*")/g,
    '<span style="color: #CE9178;">$1</span>'
  );
  highlighted = highlighted.replace(
    /('(?:[^'\\]|\\.)*')/g,
    '<span style="color: #CE9178;">$1</span>'
  );

  // Numbers (integers and decimals)
  highlighted = highlighted.replace(
    /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
    '<span style="color: #B5CEA8;">$1</span>'
  );

  // SPDX License
  highlighted = highlighted.replace(
    /(SPDX-License-Identifier:\s*\w+)/g,
    '<span style="color: #6A9955; font-style: italic;">$1</span>'
  );

  // Pragma directive
  highlighted = highlighted.replace(
    /\b(pragma)\s+(solidity)\s+([^;]+)/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> <span style="color: #4FC1FF; font-weight: 600;">$2</span> <span style="color: #CE9178;">$3</span>'
  );

  // Import statements
  highlighted = highlighted.replace(
    /\b(import)\s+/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> '
  );

  // Contract/Interface/Library keywords
  highlighted = highlighted.replace(
    /\b(contract|interface|library|abstract)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> <span style="color: #4EC9B0; font-weight: 600;">$2</span>'
  );

  // Function definitions
  highlighted = highlighted.replace(
    /\b(function)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> <span style="color: #DCDCAA;">$2</span>'
  );

  // Constructor
  highlighted = highlighted.replace(
    /\b(constructor)\b/g,
    '<span style="color: #DCDCAA; font-weight: 600;">$1</span>'
  );

  // Modifiers
  highlighted = highlighted.replace(
    /\b(modifier)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> <span style="color: #DCDCAA;">$2</span>'
  );

  // Events
  highlighted = highlighted.replace(
    /\b(event)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '<span style="color: #C586C0; font-weight: 600;">$1</span> <span style="color: #4EC9B0;">$2</span>'
  );

   const visibilityModifiers = ['public', 'private', 'internal', 'external', 'pure', 'view', 'payable', 'virtual', 'override'];
  visibilityModifiers.forEach((modifier) => {
    const regex = new RegExp(`\\b(${modifier})\\b(?![^<]*>)`, "g");
    highlighted = highlighted.replace(
      regex,
      '<span style="color: #569CD6; font-weight: 600;">$1</span>'
    );
  });

  // Control flow keywords
  const controlFlow = ['if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'try', 'catch'];
  controlFlow.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, "g");
    highlighted = highlighted.replace(
      regex,
      '<span style="color: #C586C0; font-weight: 600;">$1</span>'
    );
  });

  // Built-in functions and globals
  const builtins = ['require', 'assert', 'revert', 'emit', 'new', 'delete', 'this', 'super'];
  builtins.forEach((builtin) => {
    const regex = new RegExp(`\\b(${builtin})\\b(?![^<]*>)`, "g");
    highlighted = highlighted.replace(
      regex,
      '<span style="color: #569CD6; font-weight: 600;">$1</span>'
    );
  });

  // Types
  SOLIDITY_TYPES.forEach((type) => {
    const regex = new RegExp(`\\b(${type}(?:\\d+)?)\\b(?![^<]*>)`, "g");
    highlighted = highlighted.replace(
      regex,
      '<span style="color: #4EC9B0; font-weight: 600;">$1</span>'
    );
  });

  // Address literals (0x...)
  highlighted = highlighted.replace(
    /\b(0x[a-fA-F0-9]+)\b/g,
    '<span style="color: #B5CEA8;">$1</span>'
  );

  // msg.sender, msg.value, etc.
  highlighted = highlighted.replace(
    /\b(msg|block|tx)\.(sender|value|data|timestamp|number|difficulty|origin|gasprice)\b/g,
    '<span style="color: #9CDCFE;">$1</span>.<span style="color: #9CDCFE;">$2</span>'
  );

  return highlighted;
}, []);

// 3. Add minimap scroll sync function
const handleMinimapScroll = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  if (!textareaRef.current || !minimapRef.current) return;
  
  const minimap = minimapRef.current;
  const textarea = textareaRef.current;
  const rect = minimap.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const scrollRatio = clickY / rect.height;
  
  const maxScroll = textarea.scrollHeight - textarea.clientHeight;
  textarea.scrollTop = scrollRatio * maxScroll;
}, []);


  // Get suggestions based on current word
  const getSuggestions = useCallback(
    (currentWord: string, fullText: string) => {
      if (currentWord.length < 2) return [];

      const allSuggestions = [
        ...SOLIDITY_KEYWORDS,
        ...SOLIDITY_TYPES,
        ...COMMON_FUNCTIONS,
      ];

      // Extract custom identifiers from the code
      const customIdentifiers =
        fullText.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      const uniqueIdentifiers = [...new Set(customIdentifiers)];

      const filtered = [...allSuggestions, ...uniqueIdentifiers]
        .filter(
          (suggestion) =>
            suggestion.toLowerCase().startsWith(currentWord.toLowerCase()) &&
            suggestion !== currentWord
        )
        .slice(0, 10);

      return filtered;
    },
    []
  );

  // Handle textarea input
const handleTextareaInput = useCallback(
  (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);

    // Get current word for suggestions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || "";

    // Update cursor position display
    const lines = textBeforeCursor.split("\n");
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    });

    // Show suggestions
    const newSuggestions = getSuggestions(currentWord, newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && currentWord.length >= 2);
    setSelectedSuggestion(0);
  }, [onChange, getSuggestions]);


  // Insert suggestion
  const insertSuggestion = useCallback(
    (textarea: HTMLTextAreaElement, suggestion: string) => {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPos);
      const textAfterCursor = textarea.value.substring(cursorPos);

      // Find the start of the current word
      const words = textBeforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1] || "";
      const wordStart = cursorPos - currentWord.length;

      // Replace current word with suggestion
      const newValue =
        textarea.value.substring(0, wordStart) + suggestion + textAfterCursor;
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd =
        wordStart + suggestion.length;

      setShowSuggestions(false);
      setCode(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = target.value.substring(0, start) + '    ' + target.value.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + 4;
      setCode(newValue);
      onChange?.(newValue);
      return;
    }
    
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          if (suggestions[selectedSuggestion]) {
            e.preventDefault();
            insertSuggestion(target, suggestions[selectedSuggestion]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }
    
    // Auto-complete brackets and quotes
    const autoCompleteMap: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };
    
    if (autoCompleteMap[e.key]) {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      if (e.key === '"' || e.key === "'") {
        // Check if we're closing an existing quote
        const textAfterCursor = target.value.substring(end);
        if (textAfterCursor.startsWith(e.key)) {
          e.preventDefault();
          target.selectionStart = target.selectionEnd = end + 1;
          return;
        }
      }
      
      e.preventDefault();
      const selectedText = target.value.substring(start, end);
      const newText = e.key + selectedText + autoCompleteMap[e.key];
      const newValue = target.value.substring(0, start) + newText + target.value.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + 1;
      setCode(newValue);
      onChange?.(newValue);
    }
  }, [showSuggestions, suggestions, selectedSuggestion, onChange, insertSuggestion]);



  // Insert template
  const insertTemplate = useCallback(
    (template: string) => {
      if (textareaRef.current) {
        textareaRef.current.value = template;
        setCode(template);
        onChange?.(template);
        setShowTemplates(false);
        textareaRef.current.focus();
      }
    },
    [onChange]
  );

  // Sync scroll between textarea and highlight
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (editorRef.current) {
      const target = e.target as HTMLTextAreaElement;
      editorRef.current.scrollTop = target.scrollTop;
      editorRef.current.scrollLeft = target.scrollLeft;
    }
  }, []);

  // Update code when value prop changes
  useEffect(() => {
    if (value !== code) {
      setCode(value);
      if (textareaRef.current) {
        textareaRef.current.value = value;
      }
    }
  }, [value, code]);



  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Toolbar */}
<div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
  <div className="flex items-center space-x-4">
    <span className="text-sm text-gray-300 font-medium">Solidity Editor</span>
    <div className="text-xs text-gray-500">
      Line {cursorPosition.line}, Column {cursorPosition.column}
    </div>
  </div>
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setShowMinimap(!showMinimap)}
      className={`px-3 py-1 text-xs rounded transition-colors ${
        showMinimap 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
      }`}
    >
      Minimap
    </button>
    <button
      onClick={() => setShowTemplates(!showTemplates)}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
    >
      Templates
    </button>
  </div>
</div>


{showSnipButton && (
  <div
    className="fixed z-40 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg shadow-lg cursor-pointer transition-colors flex items-center space-x-1"
    style={{
      left: `${snipButtonPosition.x}px`,
      top: `${snipButtonPosition.y}px`,
    }}
    onClick={() => {
      setShowCodeSnippet(true);
      setShowSnipButton(false);
    }}
  >
    <Code2 size={14} />
    <span className="text-sm">Snip</span>
  </div>
)}

{/* Library selection popup */}

{showCodeSnippet && !selectedLibrary && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-950 border border-rose-950/30 rounded-xl shadow-2xl max-w-lg w-full" style={{backgroundColor: '#0a0a0b'}}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-rose-950/20">
        <div>
          <h3 className="text-xl font-semibold text-rose-50">
            Select Integration Library
          </h3>
          <p className="text-sm text-rose-200/70 mt-1">
            Choose your preferred blockchain library
          </p>
        </div>
        <button
          onClick={() => {
            setShowCodeSnippet(false);
            setSelectedLibrary(null);
          }}
          className="text-rose-400/60 hover:text-rose-300 transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Library Options */}
      <div className="p-6 space-y-3">
        {[
          {
            key: 'ethers',
            name: 'Ethers.js',
            description: 'Modern TypeScript-first library with excellent documentation',
            icon: '📦'
          },
          {
            key: 'web3',
            name: 'Web3.js',
            description: 'Popular JavaScript library with extensive ecosystem',
            icon: '🌐'
          },
          {
            key: 'wagmi',
            name: 'Wagmi (React)',
            description: 'React hooks for Ethereum with built-in TypeScript support',
            icon: '⚛️'
          }
        ].map((lib) => (
          <button
            key={lib.key}
            onClick={() => setSelectedLibrary(lib.key as 'ethers' | 'web3' | 'wagmi')}
            className="w-full text-left p-4 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-lg transition-all duration-200 border border-transparent hover:border-rose-800/30 group"
            style={{backgroundColor: '#111113'}}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{lib.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-rose-50 group-hover:text-rose-300 transition-colors">
                  {lib.name}
                </div>
                <div className="text-sm text-rose-200/60 mt-1 leading-relaxed">
                  {lib.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
)}

{/* Code snippet display */}
{showCodeSnippet && selectedLibrary && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-950 border border-rose-950/30 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col" style={{backgroundColor: '#0a0a0b'}}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-rose-950/20 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-rose-950/40 rounded-lg flex items-center justify-center border border-rose-900/30">
            <span className="text-rose-300 font-semibold text-sm">
              {selectedLibrary === 'ethers' && '📦'}
              {selectedLibrary === 'web3' && '🌐'}
              {selectedLibrary === 'wagmi' && '⚛️'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-rose-50">
              {selectedLibrary === 'ethers' && 'Ethers.js Integration'}
              {selectedLibrary === 'web3' && 'Web3.js Integration'}
              {selectedLibrary === 'wagmi' && 'Wagmi Integration'}
            </h3>
            <p className="text-sm text-rose-200/70">
              Ready-to-use code snippet for your project
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowCodeSnippet(false);
            setSelectedLibrary(null);
          }}
          className="text-rose-400/60 hover:text-rose-300 transition-colors p-2"
        >
          <X size={20} />
        </button>
      </div>

      {/* Code Container */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="relative flex-1 bg-zinc-900/30 rounded-lg border border-rose-950/20 overflow-hidden" style={{backgroundColor: '#111113'}}>
          {/* Code Header with Copy Button */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-rose-950/20" style={{backgroundColor: '#0d0d0f'}}>
            <div className="flex items-center space-x-2 text-sm text-rose-200/60">
              <span className="w-3 h-3 bg-red-400/80 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400/80 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400/80 rounded-full"></span>
              <span className="ml-3 font-mono text-rose-100">
                {selectedLibrary}.js
              </span>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(generateCodeSnippet(selectedText, selectedLibrary));
                  // You can add a toast notification here
                } catch (err) {
                  console.error('Failed to copy code:', err);
                }
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-rose-800/60 hover:bg-rose-700/70 text-rose-100 text-sm rounded-md transition-colors border border-rose-700/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Code</span>
            </button>
          </div>

          {/* Code Content */}
          <div className="overflow-auto flex-1 p-4">
            <pre className="text-sm text-rose-100 font-mono leading-relaxed">
              <code>{generateCodeSnippet(selectedText, selectedLibrary)}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-zinc-900/30 border-t border-rose-950/20 flex-shrink-0" style={{backgroundColor: '#111113'}}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-rose-200/60">
            Make sure to install the required dependencies
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedLibrary(null)}
              className="px-4 py-2 text-sm text-rose-300/80 hover:text-rose-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                setShowCodeSnippet(false);
                setSelectedLibrary(null);
              }}
              className="px-6 py-2 bg-rose-800/60 hover:bg-rose-700/70 text-rose-100 text-sm rounded-lg transition-colors border border-rose-700/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Template dropdown */}
      {showTemplates && (
        <div className="absolute top-12 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30 min-w-48">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2">Contract Templates</div>
            {CONTRACT_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template.code)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor container */}
   <div className="relative flex-1 overflow-hidden flex">
  {/* Main editor */}
  <div className="flex-1 relative overflow-hidden">
    {/* Line numbers */}
    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 flex flex-col text-xs text-gray-500 pt-4 font-mono z-10">
      {code.split('\n').map((_, index) => (
        <div key={index} className="h-6 flex items-center justify-end pr-2">
          {index + 1}
        </div>
      ))}
    </div>

    {/* Syntax highlighted background */}
    <div
      ref={editorRef}
      className="absolute inset-0 pl-16 pr-4 py-4 font-mono text-sm leading-6 text-white pointer-events-none overflow-auto whitespace-pre-wrap break-words z-10"
      style={{
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
        lineHeight: "1.5",
        tabSize: 4,
      }}
      dangerouslySetInnerHTML={{ __html: highlightSolidity(code) }}
    />

    {/* Invisible textarea for input */}
    <textarea
      ref={textareaRef}
      value={code}
      onChange={handleTextareaInput}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      className="absolute inset-0 w-full h-full pl-16 pr-4 py-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-white resize-none outline-none border-none z-20"
      style={{
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
    lineHeight: "1.5",
    tabSize: 4,
    background: 'transparent !important',
    backgroundColor: 'transparent !important',
  }}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />

    {/* Suggestions dropdown */}
    {showSuggestions && suggestions.length > 0 && (
      <div
        className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 max-h-48 overflow-auto min-w-48"
        style={{
          top: "4rem",
          left: "4rem",
        }}
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
              index === selectedSuggestion
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() =>
              textareaRef.current &&
              insertSuggestion(textareaRef.current, suggestion)
            }
          >
            <div className="font-mono">{suggestion}</div>
            {COMMON_FUNCTIONS.includes(suggestion) && (
              <div className="text-xs text-gray-400 mt-1">
                Built-in function
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Minimap */}
  {showMinimap && (
    <div className="w-32 bg-gray-900 border-l border-gray-700 flex-shrink-0">
      <div
        ref={minimapRef}
        className="h-full overflow-hidden cursor-pointer relative"
        onClick={handleMinimapScroll}
      >
        <div
          className="font-mono text-xs leading-tight text-gray-400 p-1 whitespace-pre-wrap break-words pointer-events-none"
          style={{
            fontSize: '6px',
            lineHeight: '8px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            transform: 'scale(0.3)',
            transformOrigin: 'top left',
            width: '333%',
          }}
          dangerouslySetInnerHTML={{ __html: highlightSolidity(code) }}
        />
        {/* Viewport indicator */}
        <div
          className="absolute right-0 bg-blue-500 opacity-30 rounded-sm"
          style={{
            top: textareaRef.current ? (textareaRef.current.scrollTop / textareaRef.current.scrollHeight) * 100 + '%' : '0%',
            height: textareaRef.current ? (textareaRef.current.clientHeight / textareaRef.current.scrollHeight) * 100 + '%' : '100%',
            width: '4px',
          }}
        />
      </div>
    </div>
  )}
</div>

      {/* Status bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Solidity</span>
            <span>UTF-8</span>
            <span>{code.split("\n").length} lines</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Type 2+ chars for suggestions</span>
            <span>Tab to indent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolidityEditor;
