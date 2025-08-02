import React from 'react';
import { Component } from '../types';
import { 
  Settings, 
  Eye, 
  Zap, 
  Shield, 
  Database, 
  Radio, 
  Map, 
  Cpu, 
  Gift, 
  Lock, 
  Users, 
  Calendar, 
  TrendingUp 
  
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactElement;
}

// Define specific property interfaces for different component types
interface BaseProperties {
  name?: string;
  visibility?: string;
  description?: string;
  [key: string]: string | number | boolean | object | undefined; // Allow undefined in index signature
}

interface FunctionProperties extends BaseProperties {
  payable?: boolean;
  parameters?: string;
  returns?: string;
  view?: boolean;
  functionBody?: string;
  minAmount?: string;
  initCode?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface VariableProperties extends BaseProperties {
  dataType?: string;
  defaultValue?: string;
  constant?: boolean;
  immutable?: boolean;
  keyType1?: string;
  keyType2?: string;
  valueType?: string;
  fields?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface ModifierProperties extends BaseProperties {
  condition?: string;
  errorMessage?: string;
  roleType?: string;
  requiredSignatures?: number;
  signers?: string;
  proposalId?: string;
  status?: string;
  entered?: string;
  notEntered?: string;
  timeCondition?: string;
  releaseTime?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface EventProperties extends BaseProperties {
  parameters?: string;
  indexed?: boolean;
  anonymous?: boolean;
  [key: string]: string | number | boolean | object | undefined;
}

interface TokenProperties extends BaseProperties {
  symbol?: string;
  supply?: number;
  decimals?: number;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  maxSupply?: number;
  baseURI?: string;
  mintPrice?: number;
  royaltyFee?: number;
  [key: string]: string | number | boolean | object | undefined;
}

interface DeFiProperties extends BaseProperties {
  tokenA?: string;
  tokenB?: string;
  fee?: number;
  slippage?: number;
  minLiquidity?: number;
  lendingPool?: string;
  flashLoanFee?: string;
  supportedTokens?: string[];
  maxLoanAmount?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface GovernanceProperties extends BaseProperties {
  votingPeriod?: string;
  quorum?: string;
  proposalThreshold?: string;
  votingDelay?: string;
  proposalLifetime?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface OracleProperties extends BaseProperties {
  pair?: string;
  heartbeat?: string;
  deviation?: string;
  aggregatorAddress?: string;
  decimals?: number;
  [key: string]: string | number | boolean | object | undefined;
}

interface StorageProperties extends BaseProperties {
  namespace?: string;
  storageSlot?: string;
  variables?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface CrossChainProperties extends BaseProperties {
  targetChain?: string;
  bridgeAddress?: string;
  lockPeriod?: string;
  minAmount?: string;
  maxAmount?: string;
  [key: string]: string | number | boolean | object | undefined;
}

interface BatchProperties extends BaseProperties {
  maxBatchSize?: number;
  arrayType?: string;
  valueType?: string;
  checkSuccess?: boolean;
  [key: string]: string | number | boolean | object | undefined;
}

interface ProxyProperties extends BaseProperties {
  proxyType?: string;
  initializeData?: string;
  adminAddress?: string;
  implementationAddress?: string;
  [key: string]: string | number | boolean | object | undefined;
}

// Union type for all possible properties
type ComponentProperties = 
  | FunctionProperties
  | VariableProperties
  | ModifierProperties
  | EventProperties
  | TokenProperties
  | DeFiProperties
  | GovernanceProperties
  | OracleProperties
  | StorageProperties
  | CrossChainProperties
  | BatchProperties
  | ProxyProperties
  | BaseProperties;

// Updated ComponentItem interface
interface ComponentItem extends Omit<Component, 'properties'> {
  id: string;
  type: string;
  category: string;
  name: string;
  icon: React.ReactElement;
  color: string;
  description: string;
  gasEstimate: number;
  properties: ComponentProperties;
}

const componentLibrary: ComponentItem[] = [
  // Core Components
  {
    id: 'constructor',
    type: 'function',
    category: 'core',
    name: 'Constructor',
    icon: <Cpu className="w-5 h-5" />,
    color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    description: 'Initialize contract state',
    gasEstimate: 21000,
    properties: { 
      visibility: 'public',
      payable: false, 
      parameters: '',
      initCode: '// Initialize your contract here'
    }},

    {
  id: 'simple-mapping',
  type: 'mapping',
  category: 'storage',
  name: 'Simple Mapping',
  icon: <Database className="w-5 h-5" />,
  color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
  description: 'Key-value mapping storage',
  gasEstimate: 20000,
  properties: {
    name: 'balances',
    keyType: 'address',
    valueType: 'uint256',
    visibility: 'public',
    description: 'Maps addresses to balances'
  }
},
  {
  
  id: 'array-return-function',
  type: 'function',
  category: 'core', 
  name: 'Array Return Function',
  icon: <Database className="w-5 h-5" />,
  color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
  description: 'Function returning dynamic arrays',
  gasEstimate: 45000,
  properties: {
    name: 'getItems',
    visibility: 'public',
    view: true,
    returns: 'Item[] memory',
    arrayType: 'struct',
    filterLogic: 'Custom filtering logic'
  }},
  {
  id: 'enum-definition',
  type: 'enum',
  category: 'core',
  name: 'Enum Definition',
  icon: <Database className="w-5 h-5" />,
  color: 'bg-slate-100 border-slate-300 hover:bg-slate-200',
  description: 'Define enumerated types',
  gasEstimate: 0,
  properties: {
    name: 'Status',
    values: 'PENDING, ACTIVE, INACTIVE',
    visibility: 'public'
  }
},
  {
    id: 'state-variable',
    type: 'variable',
    category: 'storage',
    name: 'State Variable',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-green-100 border-green-300 hover:bg-green-200',
    description: 'Store data on blockchain',
    gasEstimate: 20000,
    properties: { 
      dataType: 'uint256', 
      visibility: 'public', 
      name: 'myVariable',
      defaultValue: '0',
      constant: false,
      immutable: false
    }
  },
  // Advanced Functions
  {
    id: 'payable-function',
    type: 'function',
    category: 'finance',
    name: 'Payable Function',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
    description: 'Function that can receive Ether',
    gasEstimate: 23000,
    properties: { 
      name: 'deposit', 
      visibility: 'external', 
      payable: true, 
      returns: '',
      minAmount: '0.01 ether',
      functionBody: 'require(msg.value >= minAmount, "Minimum amount required");'
    }
  },
  {
    id: 'view-function',
    type: 'function',
    category: 'core',
    name: 'View Function',
    icon: <Eye className="w-5 h-5" />,
    color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    description: 'Read-only function',
    gasEstimate: 0,
    properties: { 
      name: 'getBalance', 
      visibility: 'public', 
      view: true,
      returns: 'uint256',
      functionBody: 'return address(this).balance;'
    }
  },
  // Access Control
  {
    id: 'access-control',
    type: 'modifier',
    category: 'security',
    name: 'Access Control',
    icon: <Lock className="w-5 h-5" />,
    color: 'bg-red-100 border-red-300 hover:bg-red-200',
    description: 'Role-based permissions',
    gasEstimate: 2300,
    properties: { 
      name: 'onlyOwner', 
      condition: 'msg.sender == owner',
      errorMessage: 'Only owner can call this function',
      roleType: 'owner'
    }
  },
  {
    id: 'multi-sig',
    type: 'modifier',
    category: 'security',
    name: 'Multi-Signature',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    description: 'Require multiple approvals',
    gasEstimate: 5000,
    properties: { 
      name: 'requireMultipleSignatures',
      requiredSignatures: 2,
      signers: 'address[] memory signers',
      proposalId: 'bytes32'
    }
  },
  // Events and Oracles
  {
    id: 'indexed-event',
    type: 'event',
    category: 'events',
    name: 'Indexed Event',
    icon: <Radio className="w-5 h-5" />,
    color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    description: 'Searchable blockchain event',
    gasEstimate: 1500,
    properties: { 
      name: 'Transfer', 
      parameters: 'address indexed from, address indexed to, uint256 value',
      indexed: true,
      anonymous: false
    }
  },
  // Advanced Storage
  {
    id: 'nested-mapping',
    type: 'variable',
    category: 'storage',
    name: 'Nested Mapping',
    icon: <Map className="w-5 h-5" />,
    color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
    description: 'Complex data relationships',
    gasEstimate: 20000,
    properties: { 
      name: 'allowances',
      keyType1: 'address',
      keyType2: 'address', 
      valueType: 'uint256',
      visibility: 'public',
      description: 'owner => spender => amount'
    }
  },
  {
    id: 'struct',
    type: 'struct',
    category: 'storage',
    name: 'Struct',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-teal-100 border-teal-300 hover:bg-teal-200',
    description: 'Custom data structure',
    gasEstimate: 0,
    properties: { 
      name: 'User',
      fields: 'address wallet; uint256 balance; bool active; string name',
      visibility: 'public'
    }
  },
  // Time-based
  {
    id: 'time-lock',
    type: 'modifier',
    category: 'time',
    name: 'Time Lock',
    icon: <Calendar className="w-5 h-5" />,
    color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    description: 'Time-based restrictions',
    gasEstimate: 2100,
    properties: { 
      name: 'onlyAfter',
      timeCondition: 'block.timestamp >= releaseTime',
      releaseTime: '1 days',
      description: 'Only executable after specified time'
    }
  },
  // DeFi Components
  {
    id: 'liquidity-pool',
    type: 'template',
    category: 'defi',
    name: 'Liquidity Pool',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-rose-100 border-rose-300 hover:bg-rose-200',
    description: 'AMM liquidity pool logic',
    gasEstimate: 150000,
    properties: { 
      tokenA: 'USDC',
      tokenB: 'ETH',
      fee: 0.3,
      slippage: 0.5,
      minLiquidity: 1000
    }
  },
  // Security Components
  {
    id: 'reentrancy-guard',
    type: 'modifier',
    category: 'security',
    name: 'Reentrancy Guard',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
    description: 'Prevent reentrancy attacks',
    gasEstimate: 2300,
    properties: { 
      name: 'nonReentrant',
      status: '_status',
      entered: '_ENTERED',
      notEntered: '_NOT_ENTERED'
    }
  },
  // Token Standards
  {
    id: 'erc20-advanced',
    type: 'template',
    category: 'tokens',
    name: 'ERC-20 Advanced',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    description: 'Full ERC-20 with extensions',
    gasEstimate: 500000,
    properties: { 
      name: 'MyToken', 
      symbol: 'MTK', 
      supply: 1000000,
      decimals: 18,
      mintable: true,
      burnable: true,
      pausable: false,
      maxSupply: 10000000
    }
  },
  {
    id: 'erc721',
    type: 'template',
    category: 'tokens',
    name: 'ERC-721 NFT',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-pink-100 border-pink-300 hover:bg-pink-200',
    description: 'Non-Fungible Token standard',
    gasEstimate: 800000,
    properties: { 
      name: 'MyNFT', 
      symbol: 'MNFT',
      baseURI: 'https://api.mynft.com/metadata/',
      maxSupply: 10000,
      mintPrice: 0.08,
      royaltyFee: 5
    }
  },
  // Governance Components
  {
    id: 'dao-voting',
    type: 'template',
    category: 'governance',
    name: 'DAO Voting',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-violet-100 border-violet-300 hover:bg-violet-200',
    description: 'Decentralized voting mechanism',
    gasEstimate: 180000,
    properties: {
      votingPeriod: '3 days',
      quorum: '4%',
      proposalThreshold: '1%',
      votingDelay: '1 day',
      proposalLifetime: '7 days'
    }
  },

  // Oracle Integration
  {
    id: 'chainlink-price-feed',
    type: 'template',
    category: 'oracle',
    name: 'Price Feed Oracle',
    icon: <Radio className="w-5 h-5" />,
    color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    description: 'Chainlink price feed integration',
    gasEstimate: 42000,
    properties: {
      pair: 'ETH/USD',
      heartbeat: '1 hour',
      deviation: '0.5%',
      aggregatorAddress: '',
      decimals: 8
    }
  },

  // Advanced Storage Patterns
  {
    id: 'diamond-storage',
    type: 'storage',
    category: 'storage',
    name: 'Diamond Storage',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
    description: 'EIP-2535 Diamond storage pattern',
    gasEstimate: 0,
    properties: {
      namespace: 'LibStorage',
      storageSlot: 'keccak256("diamond.storage")',
      variables: 'mapping(address => uint256) balances'
    }
  },

  // Cross-Chain
  {
    id: 'bridge-connector',
    type: 'template',
    category: 'crosschain',
    name: 'Bridge Connector',
    icon: <Map className="w-5 h-5" />,
    color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
    description: 'Cross-chain bridge integration',
    gasEstimate: 250000,
    properties: {
      targetChain: 'Polygon',
      bridgeAddress: '',
      lockPeriod: '1 hour',
      minAmount: '0.1',
      maxAmount: '100'
    }
  },

  // Gas Optimization
  {
    id: 'batch-transfer',
    type: 'function',
    category: 'optimization',
    name: 'Batch Transfer',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-amber-100 border-amber-300 hover:bg-amber-200',
    description: 'Gas-optimized batch operations',
    gasEstimate: 65000,
    properties: {
      maxBatchSize: 100,
      arrayType: 'address[]',
      valueType: 'uint256[]',
      checkSuccess: true
    }
  },

  // Proxy Patterns
  {
    id: 'upgradeable-proxy',
    type: 'template',
    category: 'proxy',
    name: 'Upgradeable Proxy',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-sky-100 border-sky-300 hover:bg-sky-200',
    description: 'OpenZeppelin upgradeable proxy',
    gasEstimate: 350000,
    properties: {
      proxyType: 'UUPS',
      initializeData: '',
      adminAddress: '',
      implementationAddress: ''
    }
  },

  // Flash Loans
  {
    id: 'flash-loan',
    type: 'template',
    category: 'defi',
    name: 'Flash Loan',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-fuchsia-100 border-fuchsia-300 hover:bg-fuchsia-200',
    description: 'Flash loan functionality',
    gasEstimate: 120000,
    properties: {
      lendingPool: '',
      flashLoanFee: '0.09%',
      supportedTokens: ['DAI', 'USDC', 'USDT'],
      maxLoanAmount: '1000000'
    }
  }
];

// Add new categories
const categories: Category[] = [
  { id: 'all', name: 'All Components', icon: <Settings className="w-4 h-4" /> },
  { id: 'core', name: 'Core', icon: <Cpu className="w-4 h-4" /> },
  { id: 'storage', name: 'Storage', icon: <Database className="w-4 h-4" /> },
  { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'finance', name: 'Finance', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'tokens', name: 'Tokens', icon: <Zap className="w-4 h-4" /> },
  { id: 'defi', name: 'DeFi', icon: <Gift className="w-4 h-4" /> },
  { id: 'events', name: 'Events', icon: <Radio className="w-4 h-4" /> },
  { id: 'time', name: 'Time', icon: <Calendar className="w-4 h-4" /> },
  { id: 'governance', name: 'Governance', icon: <Users className="w-4 h-4" /> },
  { id: 'oracle', name: 'Oracles', icon: <Radio className="w-4 h-4" /> },
  { id: 'crosschain', name: 'Cross-Chain', icon: <Map className="w-4 h-4" /> },
  { id: 'optimization', name: 'Optimization', icon: <Zap className="w-4 h-4" /> },
  { id: 'proxy', name: 'Proxy', icon: <Shield className="w-4 h-4" /> }
];

export { componentLibrary, categories, type ComponentItem, type Category };