import { useState, useCallback } from 'react';
import axios from 'axios';
import { useDeployContract, useSwitchChain, usePublicClient } from 'wagmi';
import { File } from '@/types/file';

interface CompilationResult {
  abi: string;
  bytecode: string;
  error?: string;
}

interface DeploymentResult {
  success: boolean;
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
}

export function useContractOperations() {
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const { deployContract } = useDeployContract();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const handleCompile = useCallback(async (selectedFile: File | null): Promise<CompilationResult | null> => {
    if (!selectedFile) {
      console.error("No file selected for compilation");
      return null;
    }
    
    console.log("Compiling file:", selectedFile);
    
    setIsCompiling(true);
    setCompilationResult(null);
    
    try {
      // Improved request payload structure
      const requestPayload = {
        sources: {
          [`contracts/${selectedFile.name}`]: {
            content: selectedFile.content,
          }
        },
        // Add compiler settings that most Solidity compiler APIs expect
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode.object"]
            }
          }
        }
      };

      console.log("Sending compilation request:", requestPayload);

      const response = await axios.post('/api/compile', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Compilation response:", response.data);

      if (response.status !== 200) {
        throw new Error(response.data?.error || "Compilation failed!");
      }

      const result = response.data;
      
      if (result.error) {
        throw new Error(result.error);
      }

      // More robust contract extraction
      let contractData;
      let contractName = selectedFile.name.replace('.sol', '');
      
      // Try different ways to access the compiled contract
      if (result.contracts) {
        // Method 1: Direct access by contract name
        if (result.contracts[contractName]) {
          contractData = result.contracts[contractName];
        }
        // Method 2: Access by full path
        else if (result.contracts[`contracts/${selectedFile.name}`] && 
                 result.contracts[`contracts/${selectedFile.name}`][contractName]) {
          contractData = result.contracts[`contracts/${selectedFile.name}`][contractName];
        }
        // Method 3: Get first available contract
        else {
          const contractKeys = Object.keys(result.contracts);
          if (contractKeys.length > 0) {
            const firstContractKey = contractKeys[0];
            if (typeof result.contracts[firstContractKey] === 'object') {
              const subKeys = Object.keys(result.contracts[firstContractKey]);
              if (subKeys.length > 0) {
                contractData = result.contracts[firstContractKey][subKeys[0]];
                contractName = subKeys[0];
              }
            } else {
              contractData = result.contracts[firstContractKey];
            }
          }
        }
      }

      if (!contractData) {
        console.error("Available contracts:", Object.keys(result.contracts || {}));
        throw new Error(`Contract "${contractName}" not found in compilation result`);
      }

      console.log(`Found contract data for: ${contractName}`, contractData);

      // Extract ABI and bytecode with better error handling
      let abi, bytecode;
      
      if (contractData.abi) {
        abi = typeof contractData.abi === 'string' ? contractData.abi : JSON.stringify(contractData.abi);
      } else {
        console.warn("No ABI found for contract");
        abi = '[]';
      }

      if (contractData.bytecode) {
        bytecode = contractData.bytecode;
      } else if (contractData.evm?.bytecode?.object) {
        bytecode = contractData.evm.bytecode.object;
      } else {
        console.warn("No bytecode found for contract");
        bytecode = '';
      }

      // Clean bytecode (remove 0x prefix if present for storage)
      if (bytecode && bytecode.startsWith('0x')) {
        bytecode = bytecode.slice(2);
      }

      const newCompilationResult: CompilationResult = {
        abi,
        bytecode,
      };

      setCompilationResult(newCompilationResult);
      console.log(`Successfully compiled contract: ${contractName}`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.warn('Compilation warnings:', result.warnings);
      }

      return newCompilationResult;
      
    } catch (error) {
      console.error("Compilation Error:", error);
      
      let errorMessage = "Compilation failed! Check your Solidity code.";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.error || 
                        error.response.data?.message || 
                        `Server error: ${error.response.status}`;
          console.error("Server response:", error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "No response from compilation server. Check if the API is running.";
        } else {
          // Something else happened
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorResult: CompilationResult = {
        abi: '',
        bytecode: '',
        error: errorMessage,
      };

      setCompilationResult(errorResult);
      return errorResult;
    } finally {
      setIsCompiling(false);
    }
  }, []);

  const handleDeploy = useCallback(async (): Promise<DeploymentResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!compilationResult || compilationResult.error) {
          throw new Error("No valid compilation result available for deployment");
        }

        if (!compilationResult.bytecode) {
          throw new Error("No bytecode available for deployment");
        }

        console.log("Switching to chain 420420421");
        await switchChain({ chainId: 420420421 });

        // Ensure bytecode has 0x prefix for deployment
        const deployBytecode = compilationResult.bytecode.startsWith('0x') 
          ? compilationResult.bytecode 
          : `0x${compilationResult.bytecode}`;

        const deployAbi = compilationResult.abi ? JSON.parse(compilationResult.abi) : [];

        console.log("Deploying contract with:", { 
          abiLength: deployAbi.length, 
          bytecodeLength: deployBytecode.length 
        });

        await deployContract(
          {
            abi: deployAbi,
            bytecode: deployBytecode as `0x${string}`,
            args: [], 
          },
          {
            onError: (error) => {
              console.error("Deployment error:", error);
              reject(new Error(`Deployment failed: ${error.message}`));
            },
            onSuccess: async (transactionHash) => {
              console.log("Contract deployed successfully, tx hash:", transactionHash);
              
              if (!publicClient) {
                reject(new Error("Public client not available"));
                return;
              }

              try {
                console.log("Waiting for transaction receipt...");
                const receipt = await publicClient.waitForTransactionReceipt({ 
                  hash: transactionHash,
                  timeout: 60000 // 60 second timeout
                });
                
                console.log("Transaction receipt:", receipt);

                if (receipt.contractAddress) {
                  setDeployedAddress(receipt.contractAddress);
                  
                  const result: DeploymentResult = {
                    success: true,
                    contractAddress: receipt.contractAddress,
                    transactionHash: transactionHash,
                    gasUsed: receipt.gasUsed?.toString() || "0"
                  };
                  
                  resolve(result);
                } else {
                  reject(new Error("Contract address not found in transaction receipt"));
                }
              } catch (receiptError) {
                console.error("Error waiting for receipt:", receiptError);
                reject(new Error(`Failed to get transaction receipt: ${receiptError}`));
              }
            },
          }
        );
      } catch (error) {
        console.error("Deploy error:", error);
        reject(error instanceof Error ? error : new Error("Unknown deployment error"));
      }
    });
  }, [compilationResult, switchChain, deployContract, publicClient]);

  return {
    compilationResult,
    isCompiling,
    deployedAddress,
    handleCompile,
    handleDeploy
  };
}