'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { makeGeminiRequest } from '@/utils/api';
import { useContractStore } from '@/stores/contractStore';
import { 
  Code2, 
  Coins, 
  Image, 
  Layers3, 
  Database, 
  Brain,
  Plus,
  Sparkles,
  ChevronRight,
  Edit3,
  Trash2,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIProjectModal } from '@/components/modals/AIProjectModal';
import { useRouter } from 'next/navigation';

const ProjectHub = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateContractId, setUpdateContractId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { contracts, addContract, removeContract, updateContract } = useContractStore();
  const router = useRouter();

  const handleAIGeneration = async (description: string) => {
    try {
      const fullPrompt = `Generate a Solidity smart contract based on this description: ${description}. Please provide ONLY the Solidity code without any JSON formatting, explanations, or markdown. Start directly with the contract code.`;
      
      const response = await makeGeminiRequest(fullPrompt);
      if (response.content) {
        const newContract = {
          name: 'AIGenerated.sol',
          content: response.content,
          language: 'solidity',
          address: `temp_${Date.now()}`,
          description: description,
          version: '1.0.0',
          abi: ''
        };
        
        addContract(newContract);
        router.push('/ide/editor');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  };

  const handleUpdateContract = async (contractId: string, newDescription: string) => {
    try {
      setIsUpdating(true);
      setUpdateContractId(contractId);
      
      const contract = contracts.find(c => c.address === contractId);
      if (!contract) return;

      const fullPrompt = `Update this Solidity smart contract based on the new description: ${newDescription}. 
      Current contract: ${contract.content}
      Please provide ONLY the updated Solidity code without any JSON formatting, explanations, or markdown. Start directly with the contract code.`;
      
      const response = await makeGeminiRequest(fullPrompt);
      if (response.content) {
        const updatedContract = {
          ...contract,
          content: response.content,
          description: newDescription,
          version: `${parseFloat(contract.version) + 0.1}.0`,
        };
        
        updateContract(contractId, updatedContract);
        router.push('/ide/editor');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    } finally {
      setIsUpdating(false);
      setUpdateContractId(null);
    }
  };

  const handleDeleteContract = (contractId: string) => {
    removeContract(contractId);
    setShowDeleteConfirm(null);
  };

  const handleTemplateSelection = (projectId: string) => {
    let templateContent = '';
    let contractName = '';
    let contractDescription = '';

    switch (projectId) {
      case 'scratch':
        templateContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // Your code here
}`;
        contractName = 'MyContract.sol';
        contractDescription = 'Custom contract built from scratch';
        break;

      case 'erc20':
        templateContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`;
        contractName = 'MyToken.sol';
        contractDescription = 'ERC-20 fungible token contract';
        break;

      case 'erc721':
        templateContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("MyNFT", "NFT") {}

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`;
        contractName = 'MyNFT.sol';
        contractDescription = 'ERC-721 non-fungible token contract';
        break;

      case 'erc1155':
        templateContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyMultiToken is ERC1155, Ownable {
    constructor() ERC1155("https://game.example/api/item/{id}.json") {}

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}`;
        contractName = 'MyMultiToken.sol';
        contractDescription = 'ERC-1155 multi-token contract';
        break;

      case 'oracle':
        templateContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor() {
        // ETH/USD Price Feed
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
    }

    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}`;
        contractName = 'PriceOracle.sol';
        contractDescription = 'Chainlink oracle integration contract';
        break;

      default:
        return;
    }

    if (templateContent) {
      const newContract = {
        name: contractName,
        content: templateContent,
        language: 'solidity',
        address: `temp_${Date.now()}`,
        description: contractDescription,
        version: '1.0.0',
        abi: ''
      };

      addContract(newContract);
      router.push('/ide/editor');
    }
  };

  const projects = [
    {
      id: 'scratch',
      title: 'Create From Scratch',
      subtitle: 'Build Custom',
      description: 'Full creative control with unlimited possibilities',
      icon: Code2,
      color: '#FF6B6B',
      bgGradient: 'from-red-500/10 via-pink-500/5 to-transparent',
    },
    {
      id: 'erc20',
      title: 'ERC-20 Template',
      subtitle: 'Fungible Token',
      description: 'Standard token implementation ready to deploy',
      icon: Coins,
      color: '#4ECDC4',
      bgGradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
    },
    {
      id: 'erc721',
      title: 'ERC-721 Template',
      subtitle: 'NFT Collection',
      description: 'Unique digital assets with metadata support',
      icon: Image,
      color: '#45B7D1',
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    },
    {
      id: 'erc1155',
      title: 'ERC-1155 Template',
      subtitle: 'Multi-Token',
      description: 'Batch operations for complex token ecosystems',
      icon: Layers3,
      color: '#96CEB4',
      bgGradient: 'from-green-500/10 via-emerald-500/5 to-transparent',
    },
    {
      id: 'oracle',
      title: 'Oracle Integration',
      subtitle: 'Data Bridge',
      description: 'Connect blockchain to real-world information',
      icon: Database,
      color: '#FFEAA7',
      bgGradient: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    },
    {
      id: 'ai',
      title: 'AI-Powered Project',
      subtitle: 'Smart AI',
      description: 'Machine learning integrated blockchain solutions',
      icon: Brain,
      color: '#DDA0DD',
      bgGradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
    }
  ];

  return (
    <div className=" bg-black p-8 relative pt-30">
      {/* Grid background */}
      <div className="text-center mb-12 sm:mb-16 lg:mb-20 z-10">
        <h4 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 tracking-tight">
          BUILD WITH ASSETHUB
        </h4>
      </div>
      <div
        className={cn(
          "absolute inset-0 z-0",
          "[background-size:20px_20px]",
          "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black"></div>
      
      {/* Existing Contracts Section */}
      {contracts.length > 0 && (
        <div className="relative z-10 mb-12 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-400" />
            Your Contracts ({contracts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract) => (
              <Card
                key={contract.address}
                className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl transition-all duration-300 hover:border-zinc-700/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {contract.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {contract.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="bg-zinc-800 px-2 py-1 rounded">
                          v{contract.version}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      onClick={() => {
                        const newDescription = prompt('Enter new description for contract update:', contract.description);
                        if (newDescription) {
                          handleUpdateContract(contract.address, newDescription);
                        }
                      }}
                      disabled={isUpdating && updateContractId === contract.address}
                    >
                      {isUpdating && updateContractId === contract.address ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Edit3 className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => setShowDeleteConfirm(contract.address)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-green-400 hover:text-green-300 hover:bg-green-400/10 flex-1"
                      onClick={() => router.push('/ide/editor')}
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Template Cards */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
          Create New Project
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {projects.map((project) => {
            const IconComponent = project.icon;
            const isActive = activeCard === project.id;
            
            return (
              <Card
                key={project.id}
                className={`
                  group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl 
                  transition-all duration-500 cursor-pointer overflow-hidden h-full
                  hover:border-zinc-700/50 hover:shadow-2xl hover:shadow-black/50
                  ${isActive ? 'scale-[1.02] shadow-2xl shadow-black/50' : ''}
                `}
                onMouseEnter={() => setActiveCard(project.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${project.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: project.color }}
                />
                
                <CardContent className="relative z-10 p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${project.color}15`, border: `1px solid ${project.color}30` }}
                    >
                      <IconComponent 
                        className="w-6 h-6 transition-all duration-300" 
                        style={{ color: project.color }}
                      />
                    </div>
                    <div 
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${project.color}20`, 
                        color: project.color,
                        border: `1px solid ${project.color}30`
                      }}
                    >
                      {project.subtitle}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                  </p>

                  <Button 
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold py-4 transition-all duration-300 group/btn rounded-xl"
                    variant="ghost"
                    onClick={() => project.id === 'ai' ? setIsAIModalOpen(true) : handleTemplateSelection(project.id)}
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
                    Create Project
                    <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Delete Contract</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                className="flex-1 border border-zinc-700 hover:bg-zinc-800"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDeleteContract(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    
      <AIProjectModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIGeneration}
      />
    </div>
  );
};

export default ProjectHub;