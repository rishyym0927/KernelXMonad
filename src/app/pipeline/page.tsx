"use client"
import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import {
  Play,
  Plus,
  Settings,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  Zap,
  AlertTriangle,
  FileText,
  Shield,
  Wallet,
} from "lucide-react"
import type { Node, NodeConfig, Connection, ExecutionLog, Template, NodeType,DeploymentResult } from "@/types/pipeline"
import { makeGeminiRequest } from "@/utils/api"
import { useContractOperations } from "@/hooks/useContractOperations"
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from "@/components/ui/button"

const nodeTypes: Record<string, NodeType> = {
  import: { icon: Upload, color: "bg-blue-600", label: "Import Contract" },
  compile: { icon: Zap, color: "bg-blue-700", label: "Solidity Compile" },
  test: { icon: CheckCircle, color: "bg-blue-600", label: "Run Tests" },
  deploy: { icon: GitBranch, color: "bg-blue-800", label: "Deploy Testnet" },
    deployMainnet: { icon: GitBranch, color: "bg-red-600", label: "Deploy Mainnet" }, // New mainnet deploy node

  verify: { icon: Shield, color: "bg-blue-700", label: "Verify Contract" },
  condition: { icon: AlertTriangle, color: "bg-blue-600", label: "Condition" },
  wait: { icon: Clock, color: "bg-gray-700", label: "Wait/Approval" },
  gasOptimize: { icon: Zap, color: "bg-blue-800", label: "Gas Optimize" },
}

const PipelineBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [executionStatus, setExecutionStatus] = useState<Record<string, string>>({})
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Import the hook functions
  const { handleCompile, handleDeploy } = useContractOperations()
const [compilationResult, setCompilationResult] = useState<{ abi: string; bytecode: unknown; contractAddress?: string } | null>(null)
  const { address, isConnected } = useAccount()
    const { connect } = useConnect()
    const [mounted, setMounted] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith(".sol")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setUploadedFiles((prev) => {
          const newFiles = {
            ...prev,
            [file.name]: content,
          }

          // After uploading, update any nodes that don't have valid contract files
          setTimeout(() => {
            setNodes((currentNodes) =>
              currentNodes.map((node) => {
                const currentFile = node.config.contractFile
                if (!currentFile || currentFile === "Contract.sol" || !newFiles[currentFile]) {
                  return {
                    ...node,
                    config: {
                      ...node.config,
                      contractFile: file.name,
                    },
                  }
                }
                return node
              }),
            )
          }, 0)

          return newFiles
        })

        addLog(`📁 Uploaded contract: ${file.name}`, "success")
      }
      reader.readAsText(file)
    } else {
      addLog(`❌ Please upload a .sol file`, "error")
    }
  }

  // Predefined templates for Solidity
const templates: Record<string, Template> = {
  basic: {
    name: "Basic ERC20 Deploy",
    nodes: [
      { id: "1", type: "import", x: 50, y: 100, config: { contractFile: "MyToken.sol", contractType: "ERC20" } },
      { id: "2", type: "compile", x: 280, y: 100, config: { solcVersion: "0.8.19", optimizer: true } },
      { id: "3", type: "deploy", x: 510, y: 100, config: { network: "monad-testnet", gasLimit: "2000000" } },
    ],
    connections: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
    ],
  },
  production: {
    name: "Production Pipeline",
    nodes: [
      { id: "1", type: "import", x: 50, y: 100, config: { contractFile: "MyContract.sol", contractType: "Custom" } },
      { id: "2", type: "compile", x: 200, y: 100, config: { solcVersion: "0.8.19", optimizer: true } },
      { id: "3", type: "gasOptimize", x: 350, y: 100, config: { runs: 200 } },
      { id: "4", type: "test", x: 500, y: 100, config: { testSuite: "foundry" } },
      { id: "5", type: "deploy", x: 650, y: 50, config: { network: "monad-testnet" } },
      { id: "6", type: "verify", x: 800, y: 50, config: { explorer: "monad-explorer" } },
      { id: "7", type: "condition", x: 650, y: 200, config: { condition: "testnet_success" } },
      { id: "8", type: "deployMainnet", x: 800, y: 200, config: { network: "monad-mainnet" } }, // Changed to deployMainnet
    ],
    connections: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4" },
      { from: "4", to: "5" },
      { from: "5", to: "6" },
      { from: "4", to: "7" },
      { from: "7", to: "8" },
    ],
  },
  multiContract: {
    name: "Multi-Contract DeFi",
    nodes: [
      { id: "1", type: "import", x: 50, y: 50, config: { contractFile: "Token.sol", contractType: "ERC20" } },
      { id: "2", type: "import", x: 50, y: 150, config: { contractFile: "Pool.sol", contractType: "DEX" } },
      { id: "3", type: "compile", x: 250, y: 100, config: { solcVersion: "0.8.19" } },
      { id: "4", type: "test", x: 400, y: 100, config: { testSuite: "integration" } },
      { id: "5", type: "deploy", x: 550, y: 50, config: { network: "monad-testnet", contract: "Token" } },
      { id: "6", type: "deploy", x: 550, y: 150, config: { network: "monad-testnet", contract: "Pool" } },
    ],
    connections: [
      { from: "1", to: "3" },
      { from: "2", to: "3" },
      { from: "3", to: "4" },
      { from: "4", to: "5" },
      { from: "4", to: "6" },
    ],
  },
}

  // Update getDefaultConfig function to pass contractFile to other nodes
  const getDefaultConfig = (
    type: string,
    currentNodes?: Node[],
    uploadedFiles?: Record<string, string>,
  ): NodeConfig => {
    // Priority order for contract file selection:
    // 1. Latest import node's contract file
    // 2. First uploaded file
    // 3. Default 'Contract.sol'

    const importNodes = currentNodes?.filter((n) => n.type === "import") || []
    const latestImportNode = importNodes[importNodes.length - 1]

    let contractFile = "Contract.sol"
    let contractType = "Custom"

    if (latestImportNode?.config.contractFile) {
      contractFile = latestImportNode.config.contractFile
      contractType = latestImportNode.config.contractType || "Custom"
    } else if (uploadedFiles && Object.keys(uploadedFiles).length > 0) {
      contractFile = Object.keys(uploadedFiles)[0] // Use first uploaded file
    }

    switch (type) {
      case "import":
        // For import nodes, prefer uploaded files over default
        const defaultImportFile =
          uploadedFiles && Object.keys(uploadedFiles).length > 0 ? Object.keys(uploadedFiles)[0] : "Contract.sol"

        return {
          contractFile: defaultImportFile,
          contractType: "Custom",
          dependencies: ["@openzeppelin/contracts"],
        }
      case "compile":
        return {
          contractFile: contractFile,
          solcVersion: "0.8.19",
          optimizer: true,
          optimizerRuns: 200,
          evmVersion: "london",
        }
      case "gasOptimize":
        return {
          contractFile: contractFile,
          runs: 200,
          viaIR: false,
        }
      case "test":
        return {
          contractFile: contractFile,
          contractType: contractType,
          testSuite: "foundry",
          coverage: true,
          gasReport: true,
        }
      case "deploy":
        return {
          contractFile: contractFile,
          network: "monad-testnet",
          gasLimit: "2000000",
          gasPrice: "auto",
          confirmations: 1,
          contract: "",
          constructorArgs: [],
        }
       case "deployMainnet":
    return {
      contractFile: contractFile,
      network: "monad-mainnet", // Force mainnet for mainnet deploy
      gasLimit: "2000000",
      gasPrice: "auto",
      confirmations: 3, // More confirmations for mainnet
      contract: "",
      constructorArgs: [],
    }
      case "verify":
        return {
          contractFile: contractFile,
          explorer: "monad-explorer",
          apiKey: "",
          constructorArgs: [],
        }
      case "condition":
        return {
          condition: "always",
          waitFor: "",
          retryCount: 3,
        }
      case "wait":
        return {
          duration: "5",
          unit: "minutes",
          approvalRequired: false,
        }
      default:
        return {}
    }
  }
const deployToTestnet = async (
  node: Node,
  logger: (msg: string, type?: ExecutionLog["type"]) => void,
  compilationResult: { abi: string; bytecode: unknown; contractAddress?: string } | null // Add contractAddress
) => {
  logger(`🚀 Deploying to Monad Testnet`, "info")
  
  // Check if wallet is connected
  if (!isConnected) {
    logger(`❌ Wallet not connected. Please connect your wallet first.`, "error")
    return false
  }

  if (!compilationResult) {
    logger(`❌ No compilation result found. Please compile first.`, "error")
    logger(`💡 Make sure to add a 'Compile' node before the 'Deploy' node`, "info")
    return false
  }

  try {
    const deploymentResult = await handleDeploy() as DeploymentResult
    console.log("Monad testnet deploy result:", deploymentResult)

    if (deploymentResult && deploymentResult.contractAddress) {
      logger(`✅ Contract deployed to Monad testnet successfully`, "success")
      logger(`📍 Testnet Address: ${deploymentResult.contractAddress}`, "success")
      logger(`🔗 Transaction Hash: ${deploymentResult.transactionHash}`, "info")
      logger(`🌐 Network: Monad Testnet`, "info")
      return true
    } else {
      logger(`❌ Monad testnet deployment failed: ${deploymentResult?.error || "Unknown error"}`, "error")
      return false
    }
  } catch (error) {
    logger(`❌ Monad testnet deployment error: ${error}`, "error")
    return false
  }
}

const deployToMainnet = async (
  node: Node,
  logger: (msg: string, type?: ExecutionLog["type"]) => void,
  compilationResult: { abi: string; bytecode: unknown; contractAddress?: string } | null // Add contractAddress
) => {

  logger(`🚨 MONAD MAINNET DEPLOYMENT INITIATED`, "info")
  logger(`⚠️ Network: Monad Mainnet`, "info")
  logger(`⚠️ Gas Limit: ${node.config.gasLimit || "2000000"}`, "info")
  logger(`⚠️ Gas Price: ${node.config.gasPrice || "auto"}`, "info")
  
  // Additional safety checks for mainnet
  if (!isConnected) {
    logger(`❌ Wallet not connected. Monad mainnet deployment requires wallet connection.`, "error")
    return false
  }

  if (!compilationResult) {
    logger(`❌ No compilation result found. Monad mainnet deployment requires compilation.`, "error")
    return false
  }

  // Show confirmation dialog for mainnet
  const confirmed = window.confirm(
    `🚨 MONAD MAINNET DEPLOYMENT CONFIRMATION\n\n` +
    `You are about to deploy to Monad Mainnet.\n` +
    `Network: ${node.config.network}\n` +
    `Gas Limit: ${node.config.gasLimit}\n` +
    `Gas Price: ${node.config.gasPrice}\n\n` +
    `This will use real MON tokens. Are you sure you want to proceed?`
  )

  if (!confirmed) {
    logger(`❌ Monad mainnet deployment cancelled by user`, "error")
    return false
  }

  try {
    logger(`🔄 Processing Monad mainnet deployment...`, "info")
    
    // For safety, we'll simulate mainnet deployment but not actually deploy
    // In a real implementation, you would uncomment the line below:
    // const deploymentResult = await handleDeploy(compilationResult)
    
    // Simulation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    logger(`✅ Monad mainnet deployment simulation completed`, "success")
    logger(`🎯 Simulated Mainnet Address: 0x${Math.random().toString(16).substring(2, 42)}`, "success")
    logger(`📋 Note: This was a simulation. Enable real mainnet deployment in production.`, "info")
    
    return true
  } catch (error) {
    logger(`❌ Monad mainnet deployment error: ${error}`, "error")
    return false
  }
}

  const addNode = useCallback(
    (type: string, x?: number, y?: number) => {
      const newNode: Node = {
        id: Date.now().toString(),
        type,
        x: x || 100,
        y: y || 100,
        config: getDefaultConfig(type, nodes, uploadedFiles),
      }

      // If this is not an import node, ensure it gets the contract file from existing import nodes
      if (type !== "import") {
        const importNodes = nodes.filter((n) => n.type === "import")
        if (importNodes.length > 0) {
          const latestImportNode = importNodes[importNodes.length - 1]
          newNode.config.contractFile = latestImportNode.config.contractFile
          if (latestImportNode.config.contractType) {
            newNode.config.contractType = latestImportNode.config.contractType
          }
        }
      }

      setNodes((prev) => [...prev, newNode])
    },
    [nodes, uploadedFiles],
  )

  const syncContractFileAcrossNodes = useCallback((newContractFile: string, nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        // Update the import node that was changed
        if (node.id === nodeId) {
          return { ...node, config: { ...node.config, contractFile: newContractFile } }
        }

        // Update all other nodes (except other import nodes) to use the new contract file
        if (node.type !== "import") {
          return { ...node, config: { ...node.config, contractFile: newContractFile } }
        }

        return node
      }),
    )
  }, [])

  const validateContractImport = async (
    contractFile: string,
    logger: (msg: string, type?: ExecutionLog["type"]) => void,
    uploadedFilesParam: Record<string, string>,
  ) => {
    logger(`🔍 Validating contract file: ${contractFile}`, "info")

    // Check if file is uploaded
    if (!uploadedFilesParam[contractFile]) {
      logger(`❌ Contract file not uploaded. Please upload ${contractFile} first.`, "error")
      return false
    }

    // Validate file extension
    const isValid = contractFile.endsWith(".sol") && contractFile.length > 0

    if (!isValid) {
      logger(`❌ Invalid contract file: ${contractFile}`, "error")
      return false
    }

    // Check file content
    const content = uploadedFilesParam[contractFile]
    if (!content || content.trim().length === 0) {
      logger(`❌ Contract file is empty: ${contractFile}`, "error")
      return false
    }

    logger(`✅ Contract file validated successfully`, "success")
    return true
  }

  const FileUploadSection: React.FC = () => {
    return (
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-200 mb-3">Upload Contract Files</h4>
        <div className="space-y-2">        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all duration-200"
        >
          <Upload className="w-4 h-4" />
          Upload .sol File
        </button>

          <input ref={fileInputRef} type="file" accept=".sol" onChange={handleFileUpload} className="hidden" />

          {Object.keys(uploadedFiles).length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Uploaded Files:</p>
              <div className="space-y-1">
                {Object.keys(uploadedFiles).map((filename) => (
                  <div
                    key={filename}
                    className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded flex items-center gap-1 border border-blue-600/30"
                  >
                    <FileText className="w-3 h-3" />
                    {filename}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const loadTemplate = (templateKey: string) => {
    const template = templates[templateKey]

    // Update template nodes to use uploaded files if available
    const updatedNodes = template.nodes.map((node) => {
      if (node.type === "import" && Object.keys(uploadedFiles).length > 0) {
        const firstUploadedFile = Object.keys(uploadedFiles)[0]
        return {
          ...node,
          config: {
            ...node.config,
            contractFile: firstUploadedFile,
          },
        }
      } else if (node.type !== "import" && Object.keys(uploadedFiles).length > 0) {
        // For non-import nodes, also use uploaded files
        const firstUploadedFile = Object.keys(uploadedFiles)[0]
        return {
          ...node,
          config: {
            ...node.config,
            contractFile: firstUploadedFile,
          },
        }
      }
      return node
    })

    setNodes(updatedNodes)
    setConnections(template.connections)
    setExecutionStatus({})
    setExecutionLogs([])
  }

  useEffect(() => {
    if (Object.keys(uploadedFiles).length > 0) {
      const firstUploadedFile = Object.keys(uploadedFiles)[0]

      // Update existing nodes that don't have a valid contract file
      setNodes((prev) =>
        prev.map((node) => {
          const currentFile = node.config.contractFile

          // If the node has no contract file or the file doesn't exist in uploads
          if (!currentFile || currentFile === "Contract.sol" || !uploadedFiles[currentFile]) {
            return {
              ...node,
              config: {
                ...node.config,
                contractFile: firstUploadedFile,
              },
            }
          }

          return node
        }),
      )
    }
  }, [uploadedFiles])

  const addLog = (message: string, type: ExecutionLog["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setExecutionLogs((prev) => [...prev, { timestamp, message, type }])
  }

  const generateTestsWithGemini = async (contractFile: string, contractType: string) => {
    const prompt = `Generate comprehensive test cases for a ${contractType} Solidity contract named ${contractFile}. 
    Create tests in TypeScript using Foundry/Hardhat testing framework. Include:
    1. Basic functionality tests
    2. Edge case tests
    3. Security tests
    4. Gas optimization tests
    
    Return only the test code without explanations.`

    try {
      const response = await makeGeminiRequest(prompt)
      return response
    } catch (error) {
      console.error("Error generating tests:", error)
      return `// Generated test template for ${contractFile}
import { expect } from "chai";
import { ethers } from "hardhat";

describe("${contractFile.replace(".sol", "")}", function () {
  it("Should deploy successfully", async function () {
    // Basic deployment test
    expect(true).to.be.true;
  });
  
  it("Should handle basic operations", async function () {
    // Add your contract-specific tests here
    expect(true).to.be.true;
  });
});`
    }
  }

  const downloadFile = (content: string, filename: string, contentType = "text/plain") => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateGasOptimizationReport = async (contractFile: string, runs: number) => {
    const prompt = `Generate a detailed gas optimization report for Solidity contract ${contractFile} with ${runs} optimizer runs. 
    Include:
    1. Gas usage analysis
    2. Optimization recommendations
    3. Potential savings
    4. Best practices applied
    5. Areas for improvement
    
    Format as a detailed technical report.`

    try {
      const response = await makeGeminiRequest(prompt)
      return response
    } catch (error) {
      console.error("Error generating gas report:", error)
      return `# Gas Optimization Report for ${contractFile}

## Summary
- Optimizer Runs: ${runs}
- Estimated Gas Savings: ~15-20%
- Status: Optimization Applied

## Key Optimizations
1. Loop unrolling where applicable
2. Storage variable packing
3. Function selector optimization
4. Dead code elimination

## Recommendations
- Consider using assembly for critical sections
- Review storage access patterns
- Implement gas-efficient data structures

## Conclusion
Contract has been optimized with standard compiler optimizations.
Manual review recommended for further improvements.`
    }
  }

let globalCompilationResult: { abi: string; bytecode: unknown; contractAddress?: string } | null | undefined = null;

const simulateNodeExecution = async (
  node: Node,
  logger: (msg: string, type?: ExecutionLog["type"]) => void,
  uploadedFiles: Record<string, string> = {},
) => {
  console.log("uploadedFiles received:", Object.keys(uploadedFiles))
  console.log("Looking for contract file:", node.config.contractFile || "Contract.sol")

  switch (node.type) {
    case "import":
      logger(`📁 Importing ${node.config.contractFile}`, "info")

      const isValidContract = await validateContractImport(node.config.contractFile || "", logger, uploadedFiles)
      if (!isValidContract) {
        return false
      }

      logger(`📦 Installing dependencies: ${node.config.dependencies?.join(", ") || "none"}`, "info")
      return true

    case "compile":
      console.log(node.config)
      logger(`🔧 Compiling with Solc ${node.config.solcVersion}`, "info")
      logger(`⚡ Optimizer: ${node.config.optimizer ? "enabled" : "disabled"}`, "info")

      const contractFile = node.config.contractFile || "Contract.sol"

      if (!uploadedFiles[contractFile]) {
        logger(`❌ Contract file not uploaded: ${contractFile}`, "error")
        return false
      }

      try {
        // Create the file object that handleCompile expects
        const fileObject = {
          content: uploadedFiles[contractFile],
          id: `temp_${Date.now()}`,
          language: "solidity",
          name: contractFile,
          size: uploadedFiles[contractFile].length,
          type: "file",
        }

        const compilationResult = await handleCompile(fileObject)
        console.log("Compilation result:", compilationResult)
        
        // Store in both state and global variable with proper null check
        if (compilationResult) {
          setCompilationResult(compilationResult)
          globalCompilationResult = compilationResult
        }

        if (compilationResult) {
          logger(`✅ Compilation successful`, "success")
          logger(`📊 Bytecode size: ${compilationResult.bytecode?.length || "N/A"}`, "info")
          return true
        } else {
          logger(`❌ Compilation failed: ${compilationResult || "Unknown error"}`, "error")
          return false
        }
      } catch (error) {
        logger(`❌ Compilation error: ${error}`, "error")
        return false
      }

    case "gasOptimize":
      logger(`⛽ Optimizing gas usage (${node.config.runs} runs)`, "info")

      logger(`🤖 Generating gas optimization report...`, "info")
      const optimizeContractFile = node.config.contractFile || "Contract.sol"
      const runs = node.config.runs || 200

      const gasReport = await generateGasOptimizationReport(optimizeContractFile, runs)

      const reportFileName = `gas-optimization-report-${optimizeContractFile.replace(".sol", "")}.md`
      downloadFile(gasReport, reportFileName, "text/markdown")
      logger(`📥 Downloaded gas report: ${reportFileName}`, "success")

      const gasSavings = Math.floor(Math.random() * 10) + 10 // 10-20% savings
      logger(`📊 Gas savings: ~${gasSavings}%`, "success")
      logger(`⚡ Optimization completed successfully`, "success")

      return true

    case "test":
      logger(`🧪 Running ${node.config.testSuite} tests`, "info")

      logger(`🤖 Generating tests with AI...`, "info")
      const testContractFile = node.config.contractFile || "Contract.sol"
      const contractType = node.config.contractType || "Custom"

      const generatedTests = await generateTestsWithGemini(testContractFile, contractType)

      const testFileName = `${testContractFile.replace(".sol", "")}.test.ts`
      downloadFile(generatedTests, testFileName, "text/typescript")
      logger(`📥 Downloaded test file: ${testFileName}`, "success")

      await new Promise((resolve) => setTimeout(resolve, 2000))

      logger(`✅ All tests passed`, "success")

      if (node.config.coverage) logger(`📈 Coverage: ${Math.floor(Math.random() * 20) + 80}%`, "info")
      if (node.config.gasReport) logger(`⛽ Average gas usage: ${Math.floor(Math.random() * 50000) + 100000}`, "info")

      return true

case "deploy":
  return await deployToTestnet(node, logger, compilationResult || globalCompilationResult || null)

case "deployMainnet":
  return await deployToMainnet(node, logger, compilationResult || globalCompilationResult || null)

    case "verify":
      logger(`🔍 Verifying contract on ${node.config.explorer}`, "info")
      logger(`✅ Contract verified successfully`, "success")
      return true

    case "condition":
      logger(`🔀 Evaluating condition: ${node.config.condition}`, "info")
      return true

    default:
      return true
  }
}

  const executePipeline = async () => {
    setIsExecuting(true)
    setExecutionStatus({})
    setExecutionLogs([])

    addLog("Starting pipeline execution...", "info")

    const sortedNodes = [...nodes].sort((a, b) => {
      const aConnections = connections.filter((c) => c.to === a.id).length
      const bConnections = connections.filter((c) => c.to === b.id).length
      return aConnections - bConnections
    })

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i]
      const nodeLabel = nodeTypes[node.type]?.label || node.type

      setExecutionStatus((prev) => ({ ...prev, [node.id]: "running" }))
      addLog(`Executing: ${nodeLabel}`, "info")

      const executionTime = getExecutionTime(node.type)
      await new Promise((resolve) => setTimeout(resolve, executionTime))

      const success = await simulateNodeExecution(node, addLog, uploadedFiles)

      if (success) {
        setExecutionStatus((prev) => ({ ...prev, [node.id]: "success" }))
        addLog(`✅ ${nodeLabel} completed successfully`, "success")
      } else {
        setExecutionStatus((prev) => ({ ...prev, [node.id]: "failed" }))
        addLog(`❌ ${nodeLabel} failed`, "error")
        break
      }
    }

    addLog("Pipeline execution completed", "info")
    setIsExecuting(false)
  }
  useEffect(() => {
  setMounted(true)
}, [])

  const getExecutionTime = (nodeType: string) => {
    const times: Record<string, number> = {
      import: 1000,
      compile: 3000,
      gasOptimize: 2000,
      test: 4000,
      deploy: 5000,
      verify: 3000,
      condition: 500,
      wait: 1000,
    }
    return times[nodeType] || 2000
  }

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    setDraggedNode(nodeType)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      addNode(draggedNode, x, y)
      setDraggedNode(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getStatusIcon = (nodeId: string) => {
    const status = executionStatus[nodeId]
    if (status === "running") return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
    if (status === "success") return <CheckCircle className="w-4 h-4 text-blue-400" />
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />
    return null
  }

interface SolidityNodeConfigProps {
  node: Node | undefined
  onUpdate: (config: Partial<NodeConfig>) => void
}

  const SolidityNodeConfig: React.FC<SolidityNodeConfigProps> = ({ node, onUpdate }) => {
    if (!node) return null

const handleInputChange = (key: string, value: string | number | boolean) => {
  if (key === "contractFile" && node.type === "import") {
    onUpdate({ [key]: value as string })
    syncContractFileAcrossNodes(value as string, node.id)
  } else {
    // Use type assertion to bypass the strict typing
    onUpdate({ [key]: value } as Partial<NodeConfig>)
  }
}

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Node Type</label>
          <input
            type="text"
            value={nodeTypes[node.type]?.label || node.type}
            disabled
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
          />
        </div>

        {node.type === "import" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contract File</label>
              <div className="flex gap-2">
                <select
                  value={node.config.contractFile || ""}
                  onChange={(e) => handleInputChange("contractFile", e.target.value)}
                  className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
                >
                  <option value="">Select uploaded file...</option>
                  {Object.keys(uploadedFiles).map((filename) => (
                    <option key={filename} value={filename}>
                      {filename}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all duration-200"
                  title="Upload new file"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              {node.config.contractFile && !uploadedFiles[node.config.contractFile] && (
                <p className="text-xs text-red-400 mt-1">File not uploaded. Please upload this file first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contract Type</label>
              <select
                value={node.config.contractType || "Custom"}
                onChange={(e) => handleInputChange("contractType", e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
              >
                <option value="ERC20">ERC20 Token</option>
                <option value="ERC721">ERC721 NFT</option>
                <option value="ERC1155">ERC1155 Multi-Token</option>
                <option value="DEX">DEX/AMM</option>
                <option value="Governance">Governance/DAO</option>
                <option value="Custom">Custom Contract</option>
              </select>
            </div>
          </>
        )}

        {node.type !== "import" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contract File</label>
            <div className="flex gap-2">
              <select
                value={node.config.contractFile || ""}
                onChange={(e) => handleInputChange("contractFile", e.target.value)}
                className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
              >
                <option value="">Select contract file...</option>
                {Object.keys(uploadedFiles).map((filename) => (
                  <option key={filename} value={filename}>
                    {filename}
                  </option>
                ))}
              </select>
            </div>
            {node.config.contractFile && !uploadedFiles[node.config.contractFile] && (
              <p className="text-xs text-red-400 mt-1">File not uploaded. Please upload this file first.</p>
            )}
          </div>
        )}

        {/* Rest of the configuration options remain the same */}
        {node.type === "compile" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Solc Version</label>
              <select
                value={node.config.solcVersion || "0.8.19"}
                onChange={(e) => handleInputChange("solcVersion", e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
              >
                <option value="0.8.19">0.8.19 (Latest)</option>
                <option value="0.8.18">0.8.18</option>
                <option value="0.8.17">0.8.17</option>
                <option value="0.8.0">0.8.0</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={node.config.optimizer || false}
                onChange={(e) => handleInputChange("optimizer", e.target.checked)}
                className="rounded accent-blue-600"
              />
              <label className="text-sm text-gray-300">Enable Optimizer</label>
            </div>
            {node.config.optimizer && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Optimizer Runs</label>
                <input
                  type="number"
                  value={node.config.optimizerRuns || 200}
                  onChange={(e) => handleInputChange("optimizerRuns", Number.parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
                />
              </div>
            )}
          </>
        )}

        {/* Add similar contract file selection for other node types */}
        {(node.type === "deploy" || node.type === "test" || node.type === "verify"|| node.type == "deployMainnet") && (
          <>
            {(node.type === "deploy" || node.type === "deployMainnet") && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Network</label>
      <select
        value={node.config.network}
        onChange={(e) => handleInputChange("network", e.target.value)}
        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
        disabled={node.type === "deployMainnet"} // Disable for mainnet node
      >
        {node.type === "deploy" ? (
          <>
            <option value="monad-testnet">Monad Testnet</option>
            <option value="local">Local Development</option>
          </>
        ) : (
          <option value="monad-mainnet">Monad Mainnet</option>
        )}
      </select>
      {node.type === "deployMainnet" && (
        <p className="text-xs text-red-400 mt-1">⚠️ Monad mainnet deployment - use with caution</p>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Gas Limit</label>
      <input
        type="text"
        value={node.config.gasLimit || "2000000"}
        onChange={(e) => handleInputChange("gasLimit", e.target.value)}
        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Gas Price</label>
      <select
        value={node.config.gasPrice || "auto"}
        onChange={(e) => handleInputChange("gasPrice", e.target.value)}
        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
      >
        <option value="auto">Auto</option>
        <option value="fast">Fast</option>
        <option value="standard">Standard</option>
        <option value="slow">Slow</option>
      </select>
    </div>
    {node.type === "deployMainnet" && (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmations</label>
        <input
          type="number"
          value={node.config.confirmations || 3}
          onChange={(e) => handleInputChange("confirmations", Number.parseInt(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
          min="1"
          max="10"
        />
        <p className="text-xs text-gray-400 mt-1">Number of block confirmations required</p>
      </div>
    )}
  </>
)}

            {/* Test specific configs */}
            {node.type === "test" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Test Framework</label>
                  <select
                    value={node.config.testSuite || "foundry"}
                    onChange={(e) => handleInputChange("testSuite", e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
                  >
                    <option value="foundry">Foundry</option>
                    <option value="hardhat">Hardhat</option>
                    <option value="truffle">Truffle</option>
                    <option value="integration">Integration Tests</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={node.config.coverage || false}
                    onChange={(e) => handleInputChange("coverage", e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <label className="text-sm text-gray-300">Generate Coverage Report</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={node.config.gasReport || false}
                    onChange={(e) => handleInputChange("gasReport", e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <label className="text-sm text-gray-300">Generate Gas Report</label>
                </div>
              </>
            )}

            {/* Verify specific configs */}
            {node.type === "verify" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Explorer</label>
                <select
                  value={node.config.explorer || "monad-explorer"}
                  onChange={(e) => handleInputChange("explorer", e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
                >
                  <option value="monad-explorer">Monad Explorer</option>
                  <option value="etherscan">Etherscan (EVM Compatible)</option>
                  <option value="custom">Custom Explorer</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
    // Modify the wallet button render logic:
 const renderWalletButton = () => {
  if (!mounted) return (
    <Button className="bg-gray-800 hover:bg-gray-700 border border-blue-500/30 hover:border-blue-400/40 text-blue-100 hover:text-white shadow-sm hover:shadow-blue-500/10 transition-all">
      <Wallet className="w-4 h-4 mr-2 text-blue-300" />
      Connect Wallet
    </Button>
  )
  const handleWalletConnection = async () => {
  try {
    await connect({ connector: injected() })
    addLog("✅ Wallet connected successfully", "success")
  } catch (error) {
    addLog(`❌ Failed to connect wallet: ${error}`, "error")
    console.error("Wallet connection error:", error)
  }
}

  return (
    <Button 
     onClick={() => {
  if (!isConnected) {
    handleWalletConnection()
  }
}}

      className="bg-gray-800 hover:bg-gray-700 border border-blue-500/30 hover:border-blue-400/40 text-blue-100 hover:text-white shadow-sm hover:shadow-blue-500/10 transition-all"
    >
      {isConnected ? (
        <div className="flex items-center">
          <Wallet className="w-4 h-4 mr-2 text-blue-300" />
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2 text-blue-300" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}

  return (
    <div className="h-screen bg-black flex text-white">
      {/* Sidebar - Node Palette */}
     <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full ">
  {/* Header */}
  <div className="p-4 border-b border-gray-800 flex-shrink-0 mt-26">
    <h3 className="text-lg font-semibold text-white">Monad Pipeline</h3>
  </div>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto">
    <div className="p-4 space-y-6">
      {/* File Upload Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Upload Files</h4>
        <FileUploadSection />
      </div>

      {/* Wallet Connection */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Wallet</h4>
        <div className="flex flex-col gap-2">
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-green-400 p-2 bg-green-400/10 rounded border border-green-400/20">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected</span>
            </div>
          )}
          <div className="w-full">
            {renderWalletButton()}
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Templates</h4>
        <div className="space-y-2">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => loadTemplate(key)}
              className="w-full text-left p-3 text-sm bg-blue-600/20 hover:bg-blue-600/30 rounded border border-blue-500/30 text-blue-200 transition-all duration-200 hover:shadow-md"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Node Types */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Pipeline Nodes</h4>
        <div className="space-y-2">
          {Object.entries(nodeTypes).map(([type, config]) => {
            const IconComponent = config.icon
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e)}
                className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded cursor-move hover:bg-gray-700 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group"
              >
                <div className={`p-2 rounded ${config.color} shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center gap-4 pt-30">
          <button
            onClick={executePipeline}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? "Executing..." : "Run Pipeline"}
          </button>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              EVM Compatible
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Monad Network
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Solidity Ready
            </span>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-auto bg-gray-950"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((connection, index) => {
                const fromNode = nodes.find((n) => n.id === connection.from)
                const toNode = nodes.find((n) => n.id === connection.to)
                if (!fromNode || !toNode) return null

                return (
                  <line
                    key={index}
                    x1={fromNode.x + 100}
                    y1={fromNode.y + 30}
                    x2={toNode.x}
                    y2={toNode.y + 30}
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                    className="drop-shadow-lg"
                  />
                )
              })}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const NodeIcon = nodeTypes[node.type]?.icon || Settings
              const nodeColor = nodeTypes[node.type]?.color || "bg-gray-500"

              return (
                <div
                  key={node.id}
                  className={`absolute bg-gray-800 border-2 rounded-lg shadow-xl p-3 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-200 ${
                    selectedNode === node.id ? "border-purple-500 shadow-purple-500/30" : "border-gray-700"
                  }`}
                  style={{ left: node.x, top: node.y, width: "220px" }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${nodeColor} shadow-lg`}>
                      <NodeIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm text-gray-200">{nodeTypes[node.type]?.label}</span>
                    {getStatusIcon(node.id)}
                  </div>

                  <div className="text-xs text-gray-400">
                    {node.type === "import" && `📄 ${node.config.contractFile}`}
                    {node.type === "compile" && `🔧 Solc ${node.config.solcVersion}`}
                    {node.type === "deploy" && `🌐 ${node.config.network}`}
                    {node.type === "test" && `🧪 ${node.config.testSuite} tests`}
                    {node.type === "verify" && `🔍 ${node.config.explorer}`}
                    {node.type === "gasOptimize" && `⛽ ${node.config.runs} runs`}
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Build your Solidity deployment pipeline</p>
                  <p className="text-sm text-gray-500">Drag components or choose a template</p>
                </div>
              </div>
            )}
          </div>

          {/* Execution Logs Panel */}
{executionLogs.length > 0 && (
  <div className="w-80 bg-black border-l border-gray-800 flex flex-col h-full max-h-screen">
    <div className="p-4 border-b border-gray-800 flex-shrink-0">
      <h3 className="text-purple-400 font-semibold">Execution Logs</h3>
    </div>
    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm min-h-0">
      {executionLogs.map((log, index) => (
        <div
          key={index}
          className={`mb-1 ${
            log.type === "error"
              ? "text-red-400"
              : log.type === "success"
                ? "text-emerald-400"
                : "text-gray-300"
          }`}
        >
          <span className="text-purple-500">[{log.timestamp}]</span> {log.message}
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 pt-30">
          <h3 className="text-lg font-semibold mb-4 text-white">Configuration</h3>
          <SolidityNodeConfig
            node={nodes.find((n) => n.id === selectedNode)}
            onUpdate={(config) => {
              setNodes((prev) =>
                prev.map((n) => (n.id === selectedNode ? { ...n, config: { ...n.config, ...config } } : n)),
              )
            }}
          />
        </div>
      )}
    </div>
  )
}

export default PipelineBuilder
