// components/plugins/PluginManager.tsx
'use client'
import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { FileItem } from '@/types/editor';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface PluginManagerProps {
  selectedFile: FileItem | null;
  files: FileItem[];
  onFileUpdate: (file: FileItem) => void;
  onAddFile: (file: FileItem) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generatingType: string;
  setGeneratingType: (type: string) => void;
}

interface VulnerabilityReport {
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  title: string;
  description: string;
  recommendation: string;
  lineNumber?: number;
  category: string;
}

interface VulnerabilityAnalysis {
  timestamp: string | number | Date;
  contractName: string;
  overallScore: number;
  vulnerabilities: VulnerabilityReport[];
  gasOptimizations: string[];
  bestPractices: string[];
  summary: string;
}



// ============================================================================
// Constants
// ============================================================================

const GEMINI_API_KEY = "AIzaSyCHK_9m7dwti-kYYWmr-ciR-Kp9_QTgvOc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const VULNERABILITY_PROMPT = `
Analyze the following Solidity smart contract for security vulnerabilities, gas optimizations, and best practices. 
Provide a detailed JSON response with the following structure:
{
  "overallScore": number (0-100, where 100 is perfectly secure),
  "vulnerabilities": [
    {
      "severity": "Critical|High|Medium|Low|Info",
      "title": "Vulnerability Title",
      "description": "Detailed description",
      "recommendation": "How to fix it",
      "lineNumber": number (if applicable),
      "category": "Reentrancy|Access Control|Integer Overflow|etc"
    }
  ],
  "gasOptimizations": ["optimization suggestion 1", "optimization suggestion 2"],
  "bestPractices": ["best practice 1", "best practice 2"],
  "summary": "Overall assessment summary"
}

Contract Code:
`;

// ============================================================================
// Utility Functions
// ============================================================================

const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const createZipAndDownload = async (files: { name: string; content: string }[], zipName: string) => {
  const zip = new JSZip();
  
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// Main Component
// ============================================================================

const PluginManager: React.FC<PluginManagerProps> = ({
  selectedFile,
  files,
  onAddFile,
  isGenerating,
  setIsGenerating,
  generatingType,
  setGeneratingType,
}) => {
  const [vulnerabilityReport, setVulnerabilityReport] = useState<VulnerabilityAnalysis | null>(null);
  const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<VulnerabilityAnalysis[]>([]);

  const isDisabled = !selectedFile || isGenerating;
  const hasContracts = useMemo(() => 
    files.some(file => file.extension === 'sol'), [files]
  );

  // ============================================================================
  // Vulnerability Analysis
  // ============================================================================

  const generateVulnerabilityReport = useCallback(async () => {
    if (!selectedFile || selectedFile.extension !== 'sol') {
      alert('Please select a Solidity contract file for vulnerability analysis.');
      return;
    }

    setIsGenerating(true);
    setGeneratingType('vulnerability');

    try {
      const response = await axios({
        url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [{ 
                text: `${VULNERABILITY_PROMPT}\n\n${selectedFile.content}` 
              }],
            },
          ],
        },
      });

      const analysisText = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        const report: VulnerabilityAnalysis = {
          contractName: selectedFile.name,
          ...analysisData
        };
        
        setVulnerabilityReport(report);
        setAnalysisHistory(prev => [...prev, report]);
        setShowVulnerabilityModal(true);

        // Generate vulnerability report file
        const reportFile: FileItem = {
          id: Date.now().toString(),
          name: `${selectedFile.name.replace('.sol', '')}_vulnerability_report.json`,
          content: JSON.stringify(report, null, 2),
          type: 'file',
          extension: 'json',
          size: 0,
          language:""
        };
        
        onAddFile(reportFile);
      } else {
        throw new Error('Failed to parse vulnerability analysis');
      }
    } catch (error) {
      console.error('Vulnerability analysis failed:', error);
      alert('Failed to generate vulnerability report. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile, onAddFile, setIsGenerating, setGeneratingType]);

  // ============================================================================
  // Template Generators with Download
  // ============================================================================

  const generateHardhatTemplate = async () => {
    setIsGenerating(true);
    setGeneratingType('hardhat');
    
    try {
      const files = [
        {
          name: 'hardhat.config.js',
          content: `require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    monad: {
      url: 'https://rpc.monad.xyz',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 41454,
    },
    monadTestnet: {
      url: 'https://testnet-rpc.monad.xyz',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 41455,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};`
        },
        {
          name: 'package.json',
          content: `{
  "name": "hardhat-monad-project",
  "version": "1.0.0",
  "description": "A professional Hardhat project for Monad ecosystem",
  "main": "index.js",
  "scripts": {
    "compile": "npx hardhat compile",
    "test": "npx hardhat test",
    "test:coverage": "npx hardhat coverage",
    "deploy:local": "npx hardhat ignition deploy ./ignition/modules/Deploy.js --network localhost",
    "deploy:testnet": "npx hardhat ignition deploy ./ignition/modules/Deploy.js --network monadTestnet",
    "verify": "npx hardhat verify --network monadTestnet",
    "node": "npx hardhat node",
    "clean": "npx hardhat clean"
  },
  "keywords": ["hardhat", "monad", "ethereum", "solidity"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "hardhat": "^2.19.0",
    "hardhat-gas-reporter": "^1.0.9",
    "solidity-coverage": "^0.8.5",
    "dotenv": "^16.3.1"
  }
}`
        },
        {
          name: '.env.sample',
          content: `# Rename this file to .env and fill in your values
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here`
        },
        {
          name: 'README.md',
          content: `# Hardhat Monad Project

This project demonstrates a basic Hardhat setup for Monad ecosystem development.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.sample .env
   \`\`\`

3. Fill in your private key and API keys in the \`.env\` file

## Commands

- \`npm run compile\` - Compile contracts
- \`npm run test\` - Run tests
- \`npm run deploy:local\` - Deploy to local network
- \`npm run deploy:testnet\` - Deploy to Monad testnet

## Security

Never commit your \`.env\` file or expose your private keys!`
        }
      ];

      // Add files to editor
      files.forEach(file => {
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: file.content,
          type: 'file',
          extension: file.name.split('.').pop() || 'txt',
          size: 0,
          language:""
        };
        onAddFile(fileItem);
      });

      // Download as ZIP
      await createZipAndDownload(files, 'hardhat-monad-template.zip');
      
    } catch (error) {
      console.error('Hardhat template generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateViemTemplate = async () => {
    setIsGenerating(true);
    setGeneratingType('viem');
    
    try {
      const files = [
        {
          name: 'viem.config.ts',
          content: `import { http, createPublicClient, createWalletClient, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Define Monad chain
export const monad = defineChain({
  id: 41454,
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
    public: {
      http: ['https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
});

const transport = http(monad.rpcUrls.default.http[0]);

export const publicClient = createPublicClient({
  chain: monad,
  transport,
});

export const createWallet = (privateKey: \`0x\${string}\`) => {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: monad,
    transport,
  });
};

export const getBalance = async (address: \`0x\${string}\`) => {
  return await publicClient.getBalance({ address });
};

export const getGasPrice = async () => {
  return await publicClient.getGasPrice();
};`
        },
        {
          name: 'deploy.ts',
          content: `import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createWallet, publicClient } from './viem.config';
import { parseAbi, formatEther } from 'viem';

interface DeploymentConfig {
  contractName: string;
  privateKey: \`0x\${string}\`;
  constructorArgs?: any[];
  gasLimit?: bigint;
}

export const deployContract = async ({
  contractName,
  privateKey,
  constructorArgs = [],
  gasLimit
}: DeploymentConfig) => {
  try {
    console.log(\`🚀 Deploying \${contractName}...\`);

    // Load contract artifacts
    const artifactsPath = join(process.cwd(), 'artifacts', \`\${contractName}.json\`);
    const bytecode = \`0x\${readFileSync(
      join(process.cwd(), 'artifacts', \`\${contractName}.bin\`)
    ).toString('hex')}\` as \`0x\${string}\`;

    if (!existsSync(artifactsPath)) {
      throw new Error(\`Contract artifacts not found for \${contractName}\`);
    }

    const abi = JSON.parse(readFileSync(artifactsPath, 'utf8'));
    const wallet = createWallet(privateKey);

    // Check wallet balance
    const balance = await publicClient.getBalance({ 
      address: wallet.account.address 
    });
    console.log(\`💰 Wallet balance: \${formatEther(balance)} MON\`);

    // Deploy contract
    const hash = await wallet.deployContract({
      abi: parseAbi(abi),
      bytecode,
      args: constructorArgs,
      gas: gasLimit,
    });

    console.log(\`📝 Transaction hash: \${hash}\`);

    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(\`✅ Contract deployed successfully!\`);
      console.log(\`📍 Contract address: \${receipt.contractAddress}\`);
      console.log(\`⛽ Gas used: \${receipt.gasUsed}\`);

      // Save deployment info
      const deploymentInfo = {
        contractName,
        address: receipt.contractAddress,
        transactionHash: hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
      };

      const deploymentsFile = join(process.cwd(), 'deployments.json');
      const deployments = existsSync(deploymentsFile) 
        ? JSON.parse(readFileSync(deploymentsFile, 'utf8')) 
        : {};
      
      deployments[contractName] = deploymentInfo;
      writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));

      return receipt.contractAddress;
    } else {
      throw new Error('Deployment transaction failed');
    }
  } catch (error) {
    console.error(\`❌ Deployment failed:\`, error);
    throw error;
  }
};

// Example usage:
// deployContract({
//   contractName: 'MyContract',
//   privateKey: '0x...',
//   constructorArgs: [],
// });`
        },
        {
          name: 'package.json',
          content: `{
  "name": "viem-monad-project",
  "version": "1.0.0",
  "description": "A professional Viem project for Monad ecosystem",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "deploy": "tsx deploy.ts",
    "interact": "tsx interact.ts",
    "test": "vitest",
    "dev": "tsx --watch"
  },
  "keywords": ["viem", "monad", "ethereum", "web3"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "viem": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`
        }
      ];

      // Add files to editor and download
      files.forEach(file => {
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: file.content,
          type: 'file',
          extension: file.name.split('.').pop() || 'txt',
          size: 0,
          language:""
        };
        onAddFile(fileItem);
      });

      await createZipAndDownload(files, 'viem-monad-template.zip');
      
    } catch (error) {
      console.error('Viem template generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateTests = async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('tests');
    
    try {
      const contractName = selectedFile.name.replace(/\.[^/.]+$/, '');
      
      // Generate comprehensive test suite
      const testFiles = [
        {
          name: `${contractName}.test.sol`,
          content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../${selectedFile.name}";

contract ${contractName}Test is Test {
    ${contractName} public contractInstance;
    address public owner;
    address public user1;
    address public user2;
    
    event TestEvent(address indexed user, uint256 value);
    
    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        // Deploy contract
        contractInstance = new ${contractName}();
        
        // Setup initial state
        vm.deal(owner, 100 ether);
        vm.deal(user1, 50 ether);
        vm.deal(user2, 50 ether);
    }
    
    function testInitialState() public {
        // Test initial contract state
        assertTrue(address(contractInstance) != address(0), "Contract should be deployed");
    }
    
    function testAccessControl() public {
        // Test access control mechanisms
        vm.prank(user1);
        // Add access control tests here
    }
    
    function testRevertConditions() public {
        // Test revert conditions
        vm.expectRevert("Error message");
        // Add revert tests here
    }
    
    function testEventEmission() public {
        // Test event emissions
        vm.expectEmit(true, false, false, true);
        emit TestEvent(owner, 100);
        // Add event emission tests here
    }
    
    function testEdgeCases() public {
        // Test edge cases and boundary conditions
    }
    
    function testGasOptimization() public {
        // Test gas consumption
        uint256 gasBefore = gasleft();
        // Execute function
        uint256 gasAfter = gasleft();
        uint256 gasUsed = gasBefore - gasAfter;
        
        // Assert gas usage is within expected range
        assertTrue(gasUsed < 100000, "Gas usage too high");
    }
    
    function testFuzzInput(uint256 _randomValue) public {
        // Fuzz testing with random inputs
        vm.assume(_randomValue > 0 && _randomValue < type(uint128).max);
        // Add fuzz tests here
    }
}`
        },
        {
          name: `${contractName}.test.js`,
          content: `const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('${contractName}', function () {
  async function deployContractFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory('${contractName}');
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    
    return { contract, owner, user1, user2 };
  }
  
  describe('Deployment', function () {
    it('Should deploy successfully', async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });
    
    it('Should set the right owner', async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      // Add owner verification if applicable
    });
  });
  
  describe('Core Functionality', function () {
    it('Should handle basic operations', async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      // Add core functionality tests
    });
    
    it('Should emit events correctly', async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      // Test event emissions
    });
  });
  
  describe('Access Control', function () {
    it('Should restrict unauthorized access', async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);
      // Test access restrictions
    });
  });
  
  describe('Error Handling', function () {
    it('Should revert with correct error messages', async function () {
      const { contract } = await loadFixture(deployContractFixture);
      await expect(
        contract.someFunction()
      ).to.be.revertedWith('Expected error message');
    });
  });
  
  describe('Gas Optimization', function () {
    it('Should use reasonable gas amounts', async function () {
      const { contract } = await loadFixture(deployContractFixture);
      const tx = await contract.someFunction();
      const receipt = await tx.wait();
      
      // Assert gas usage is reasonable
      expect(receipt.gasUsed).to.be.below(100000);
    });
  });
});`
        }
      ];

      // Add test files to editor
      testFiles.forEach(file => {
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: file.content,
          type: 'file',
          extension: file.name.split('.').pop() || 'txt',
          size: 0,
          language:""
        };
        onAddFile(fileItem);
      });

      // Download test suite
      await createZipAndDownload(testFiles, `${contractName}-tests.zip`);
      
    } catch (error) {
      console.error('Test generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateDocumentation = async () => {
    if (!hasContracts) {
      alert('No Solidity contracts found to document.');
      return;
    }

    setIsGenerating(true);
    setGeneratingType('documentation');

    try {
      const solidityFiles = files.filter(file => file.extension === 'sol');
      const docFiles = [];

      // Generate README
      const readmeContent = `# Smart Contract Documentation

## Overview
This project contains ${solidityFiles.length} smart contract${solidityFiles.length > 1 ? 's' : ''}.

## Contracts
${solidityFiles.map(file => `- **${file.name}**: ${file.name.replace('.sol', '')} contract`).join('\n')}

## Setup
1. Install dependencies: \`npm install\`
2. Compile contracts: \`npm run compile\`
3. Run tests: \`npm run test\`
4. Deploy: \`npm run deploy\`

## Security
- All contracts have been analyzed for common vulnerabilities
- Follow best practices for secure deployment
- Never expose private keys in production

## License
MIT License`;

      docFiles.push({
        name: 'README.md',
        content: readmeContent
      });

      // Generate individual contract documentation
      for (const file of solidityFiles) {
        const contractDoc = `# ${file.name.replace('.sol', '')} Contract Documentation

## Contract Overview
Contract file: \`${file.name}\`

## Functions
// TODO: Add function documentation

## Events
// TODO: Add event documentation

## Modifiers
// TODO: Add modifier documentation

## Security Considerations
// TODO: Add security notes

## Usage Examples
\`\`\`solidity
// TODO: Add usage examples
\`\`\`

## Testing
Run tests with: \`npm run test\`

## Deployment
Deploy with: \`npm run deploy\`
`;

        docFiles.push({
          name: `${file.name.replace('.sol', '')}.md`,
          content: contractDoc
        });
      }

      // Add to editor and download
      docFiles.forEach(file => {
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: file.content,
          type: 'file',
          extension: 'md',
          size: 0,
          language:""
        };
        onAddFile(fileItem);
      });

      await createZipAndDownload(docFiles, 'contract-documentation.zip');

    } catch (error) {
      console.error('Documentation generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  // ============================================================================
  // Render Methods
  // ============================================================================

  const renderVulnerabilityModal = () => {
    if (!showVulnerabilityModal || !vulnerabilityReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 pt-25">
        <div className="bg-gray-900 rounded-lg max-w-4xl max-h-[80vh] overflow-auto w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Vulnerability Report: {vulnerabilityReport.contractName}
              </h2>
              <button
                onClick={() => setShowVulnerabilityModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dark Mode Score Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-white">Security Score</span>
                <span className={`text-2xl font-bold ${
                  vulnerabilityReport.overallScore >= 80 ? 'text-green-400' :
                  vulnerabilityReport.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {vulnerabilityReport.overallScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    vulnerabilityReport.overallScore >= 80 ? 'bg-green-600' :
                    vulnerabilityReport.overallScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${vulnerabilityReport.overallScore}%` }}
                ></div>
              </div>
            </div>

            {/* Dark Mode Vulnerabilities Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Vulnerabilities Found</h3>
              <div className="space-y-3">
                {vulnerabilityReport.vulnerabilities.map((vuln, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 bg-gray-800 ${
                    vuln.severity === 'Critical' ? 'border-red-500' :
                    vuln.severity === 'High' ? 'border-orange-500' :
                    vuln.severity === 'Medium' ? 'border-yellow-500' :
                    vuln.severity === 'Low' ? 'border-blue-500' :
                    'border-gray-500'
                  }`}>
                    {/* Vulnerability card content with white text */}
                    <h4 className="font-semibold text-white">{vuln.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{vuln.description}</p>
                    {vuln.lineNumber && (
                      <p className="text-sm text-gray-400 mt-1">Line: {vuln.lineNumber}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">Category: {vuln.category}</p>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-white">Recommendation:</h5>
                      <p className="text-sm text-gray-300">{vuln.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gas Optimizations */}
            {vulnerabilityReport.gasOptimizations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Gas Optimizations</h3>
                <ul className="list-disc list-inside space-y-2">
                  {vulnerabilityReport.gasOptimizations.map((opt, index) => (
                    <li key={index} className="text-gray-300">
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Best Practices */}
            {vulnerabilityReport.bestPractices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Best Practices</h3>
                <ul className="list-disc list-inside space-y-2">
                  {vulnerabilityReport.bestPractices.map((bp, index) => (
                    <li key={index} className="text-gray-300">
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Summary</h3>
              <p className="text-gray-300">{vulnerabilityReport.summary}</p>
            </div >

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowVulnerabilityModal(false)}
                className="px-4 py-2 bg-gray-800 rounded-md text-gray-300 hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (vulnerabilityReport) {
                    downloadFile(
                      JSON.stringify(vulnerabilityReport, null, 2),
                      `${vulnerabilityReport.contractName}_vulnerability_report.json`,
                      'application/json'
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-900 rounded-md text-white hover:bg-blue-800"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 pt-30">
      {/* Action Buttons - Now Vertical */}
      <div className="flex flex-col gap-4 mb-6 max-w-md">
        <button
          onClick={generateVulnerabilityReport}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-900 text-white hover:bg-red-800'
          }`}
        >
          {isGenerating && generatingType === 'vulnerability' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Analyze Vulnerabilities
            </>
          )}
        </button>

        <button
          onClick={generateHardhatTemplate}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-900 text-white hover:bg-emerald-800'
          }`}
        >
          {isGenerating && generatingType === 'hardhat' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              Generate Hardhat Template
            </>
          )}
        </button>

        <button
          onClick={generateViemTemplate}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-800'
          }`}
        >
          {isGenerating && generatingType === 'viem' ? (
            <>Generating...</>
          ) : (
            <>Generate Viem Template</>
          )}
        </button>

        <button
          onClick={generateTests}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-purple-900 text-white hover:bg-purple-800'
          }`}
        >
          {isGenerating && generatingType === 'tests' ? (
            <>Generating...</>
          ) : (
            <>Generate Tests</>
          )}
        </button>

        <button
          onClick={generateDocumentation}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-900 text-white hover:bg-indigo-800'
          }`}
        >
          {isGenerating && generatingType === 'documentation' ? (
            <>Generating...</>
          ) : (
            <>Generate Documentation</>
          )}
        </button>
      </div>

      {/* Analysis History */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Analysis History</h3>
        <div className="space-y-4">
          {analysisHistory.length === 0 ? (
            <p className="text-gray-400">No analysis reports generated yet.</p>
          ) : (
            analysisHistory.map((report, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">{report.contractName}</h4>
                  <span className="text-sm text-gray-400">
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded ${
                    report.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                    report.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {report.overallScore}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded ${
                    report.vulnerabilities.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    Vulnerabilities: {report.vulnerabilities.length}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded ${
                    report.gasOptimizations.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    Gas Optimizations: {report.gasOptimizations.length}
                  </span>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setVulnerabilityReport(report);
                      setShowVulnerabilityModal(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
          <h3 className="text-lg font-semibold mb-2">Selected File</h3>
          <p className="text-gray-700">
            <span className="font-medium">Name:</span> {selectedFile.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Type:</span> {selectedFile.type}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          <div className="mt-4">
            <button
              onClick={() => downloadFile(selectedFile.content, selectedFile.name)}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
            >
              Download File
            </button>
          </div>
        </div>
      )}

      {/* Vulnerability Report Modal */}
      {renderVulnerabilityModal()}
    </div>
  );
};

export default PluginManager;