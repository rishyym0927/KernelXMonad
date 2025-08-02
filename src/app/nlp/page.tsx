"use client"
import { useState, useCallback } from "react"
import { makeGeminiRequest } from "@/utils/api"
import {
  Code,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Play,
  Settings,
  Book,
  Zap,
  Terminal,
  FileText,
  Hash
} from "lucide-react"
import { useWriteContract, useAccount } from "wagmi"

interface ConversionResult {
  explanation?: string
  gasEstimate?: string
  requirements?: string[]
  functionCall?: string
  contractMethod?: string
  parameters?: Array<{
    name: string
    type: string
    value: string
  }>
  abi?: string
  error?: string
}

const NaturalLanguageContractInteraction = () => {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const [input, setInput] = useState("")
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [contractABI, setContractABI] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [history, setHistory] = useState<
    Array<{
      id: number
      input: string
      result: ConversionResult
      timestamp: string
    }>
  >([])
  const [savedCommands, setSavedCommands] = useState<
    Array<{
      id: number
      command: string | undefined
      timestamp: string
    }>
  >([])

  const sampleABI = `[
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    }
  ]`

  const sampleCommands = [
    "Send 100 tokens to 0x1234567890123456789012345678901234567890",
    "Check balance of 0xabcdef1234567890abcdef1234567890abcdef12",
    "Approve 50 tokens for 0x9876543210987654321098765432109876543210",
    "Get total supply of the token",
    "Transfer 25.5 tokens from my account to Alice's wallet",
  ]

  const convertNLToContract = useCallback(
    async (naturalLanguage: string): Promise<ConversionResult> => {
      const prompt = `Convert this natural language command to a smart contract function call.
    
    Natural Language: "${naturalLanguage}"
    Contract ABI: ${contractABI || sampleABI}
    
    Return a valid JSON object with:
    {
      "functionCall": "the actual function call",
      "contractMethod": "method name",
      "parameters": [{"name": "param1", "type": "type1", "value": "value1"}],
      "abi": "relevant ABI fragment",
      "gasEstimate": "estimated gas",
      "explanation": "detailed explanation"
    }`

      try {
        return await makeGeminiRequest(prompt)
      } catch (error) {
        console.error("NL to Contract conversion error:", error)
        throw new Error("Failed to convert natural language to contract call")
      }
    },
    [contractABI, sampleABI],
  )

  const handleProcess = useCallback(async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setResult(null)

    try {
      const response = await convertNLToContract(input)

      if (!response || typeof response !== "object") {
        throw new Error("Invalid response from AI service")
      }

      setResult(response)

      const historyItem = {
        id: Date.now(),
        input,
        result: response,
        timestamp: new Date().toLocaleString(),
      }
      setHistory((prev) => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Processing failed",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [input, convertNLToContract])

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text)
    }
  }

  const saveCommand = (command: string | undefined) => {
    const saved = {
      id: Date.now(),
      command,
      timestamp: new Date().toLocaleString(),
    }
    setSavedCommands((prev) => [saved, ...prev.slice(0, 4)])
  }

  const executeContract = async () => {
    if (!result || !contractAddress) {
      console.error("Missing result or contract address")
      return
    }

    try {
      if (!address) {
        throw new Error("Please connect your wallet first")
      }

      let abiFragment
      if (result.abi) {
        if (typeof result.abi === "string") {
          abiFragment = JSON.parse(result.abi)
        } else {
          abiFragment = result.abi
        }
      } else {
        throw new Error("No ABI fragment available")
      }

      if (!abiFragment) {
        throw new Error("Invalid ABI fragment")
      }

      const params = result.parameters?.map((param) => param.value) || []

      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: Array.isArray(abiFragment) ? abiFragment : [abiFragment],
        functionName: result.contractMethod || "",
        args: params,
      })

      console.log("Contract execution initiated")
    } catch (error) {
      console.error("Contract execution failed:", error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-black to-gray-900 pt-30">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Terminal className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Contract Interface</h2>
            <p className="text-sm text-gray-400">Natural language to blockchain interaction</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Contract Configuration */}
         {/* Contract Configuration */}
<div className="p-6 bg-gray-900/50 border-b border-gray-800">
  <div className="space-y-6">
    {/* Contract Address */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
        <Hash className="w-4 h-4 text-purple-400" />
        <span>Contract Address</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x1234567890123456789012345678901234567890"
          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {contractAddress && (
            <button
              onClick={() => navigator.clipboard.writeText(contractAddress)}
              className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          <Code className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      {contractAddress && (
        <div className="p-3 bg-black rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Address Preview</span>
            <span className="text-xs text-purple-400">
              {contractAddress.startsWith('0x') ? 'Valid Format' : 'Invalid Format'}
            </span>
          </div>
          <div className="font-mono text-sm text-green-400 break-all">
            {contractAddress}
          </div>
        </div>
      )}
    </div>

    {/* Contract ABI */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Contract ABI (Optional)</span>
        </div>
        {contractABI && (
          <button
            onClick={() => setContractABI("")}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </label>
      <div className="relative">
        <textarea
          value={contractABI}
          onChange={(e) => setContractABI(e.target.value)}
          placeholder='[{"inputs":[],"name":"function_name","outputs":[],"type":"function"}]'
          rows={4}
          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
        />
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {contractABI && (
            <button
              onClick={() => navigator.clipboard.writeText(contractABI)}
              className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
              title="Copy ABI"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {contractABI && (
        <div className="space-y-3">
          <div className="p-4 bg-black rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">ABI Preview</span>
              <div className="flex items-center space-x-2">
                {(() => {
                  try {
                    return (
                      <span className="flex items-center space-x-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Valid JSON</span>
                      </span>
                    );
                  } catch {
                    return (
                      <span className="flex items-center space-x-1 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>Invalid JSON</span>
                      </span>
                    );
                  }
                })()}
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(contractABI), null, 2);
                  } catch {
                    return contractABI;
                  }
                })()}
              </pre>
            </div>
          </div>
          
          {(() => {
            try {
              const parsed = JSON.parse(contractABI);
              const functions = Array.isArray(parsed) 
                ? parsed.filter(item => item.type === 'function')
                : parsed.type === 'function' ? [parsed] : [];
              
              if (functions.length > 0) {
                return (
                  <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-gray-800">
                    <h4 className="text-xs font-medium text-purple-400 mb-3">Available Functions</h4>
                    <div className="space-y-2">
                      {functions.map((func, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-black rounded border border-gray-700">
                          <span className="text-sm font-mono text-white">{func.name}</span>
                          <span className="text-xs text-gray-400">
                            {func.inputs?.length || 0} params
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch {
              return null;
            }
          })()}
        </div>
      )}
    </div>
  </div>
</div>

          {/* Input Section */}
          <div className="p-6 border-b border-gray-800">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Natural Language Command
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder='e.g., "Send 100 tokens to Alice wallet"'
                      rows={4}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg shadow-purple-600/25 transition-all duration-200"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    <span>{isProcessing ? "Processing..." : "Convert"}</span>
                  </button>
                </div>
              </div>

              {/* Sample Commands */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleCommands.slice(0, 3).map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(cmd)}
                      className="px-3 py-2 text-xs bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 border border-gray-700 transition-all duration-200"
                    >
                      {cmd.slice(0, 35)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1 p-6 overflow-auto">
            {result && (
              <div className="space-y-6">
                {result.error ? (
                  <div className="flex items-start space-x-4 p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2">Error</h3>
                      <p className="text-red-300">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Main Result */}
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-purple-400 flex items-center space-x-3">
                          <div className="p-1 bg-purple-500/10 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span>Smart Contract Call</span>
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(result.functionCall)}
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveCommand(result.functionCall)}
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                            title="Save command"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-black rounded-lg border border-gray-800">
                        <code className="text-purple-300 font-mono text-sm break-all">
                          {result.functionCall}
                        </code>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                      <h4 className="font-semibold text-purple-400 mb-3 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Explanation</span>
                      </h4>
                      <p className="text-gray-300 leading-relaxed">{result.explanation}</p>
                    </div>

                    {/* Parameters */}
                    {result.parameters && (
                      <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                        <h4 className="font-semibold text-purple-400 mb-4 flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Parameters</span>
                        </h4>
                        <div className="space-y-3">
                          {result.parameters.map((param, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                  <span className="font-medium text-white">{param.name}</span>
                                  <span className="text-gray-400 ml-2 text-sm">({param.type})</span>
                                </div>
                              </div>
                              <code className="text-purple-300 font-mono text-sm bg-gray-900 px-3 py-1 rounded">
                                {param.value}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gas & Requirements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {result.gasEstimate && (
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                          <h4 className="font-semibold text-purple-400 mb-3 flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Gas Estimate</span>
                          </h4>
                          <p className="text-gray-300 font-mono">{result.gasEstimate}</p>
                        </div>
                      )}
                      {result.requirements && (
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                          <h4 className="font-semibold text-purple-400 mb-3 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Requirements</span>
                          </h4>
                          <ul className="text-gray-300 space-y-2">
                            {result.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-center space-x-3">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Execute Button */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={executeContract}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 flex items-center space-x-3 font-semibold shadow-lg shadow-purple-600/25 transition-all duration-200"
                      >
                        <Play className="w-5 h-5" />
                        <span>Execute Contract Function</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 flex flex-col">
          {/* History */}
          <div className="p-6 border-b border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4 flex items-center space-x-3">
              <div className="p-1 bg-purple-500/10 rounded">
                <Book className="w-4 h-4 text-purple-400" />
              </div>
              <span>Recent History</span>
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-black rounded-lg border border-gray-800 cursor-pointer hover:border-purple-500/30 hover:bg-gray-900/50 transition-all duration-200"
                  onClick={() => setInput(item.input)}
                >
                  <div className="text-xs text-gray-500 mb-2">{item.timestamp}</div>
                  <div className="text-sm text-white truncate mb-2">{item.input}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Commands */}
          <div className="p-6 flex-1">
            <h3 className="font-semibold text-gray-300 mb-4 flex items-center space-x-3">
              <div className="p-1 bg-purple-500/10 rounded">
                <Settings className="w-4 h-4 text-purple-400" />
              </div>
              <span>Saved Commands</span>
            </h3>
            <div className="space-y-3">
              {savedCommands.map((saved) => (
                <div
                  key={saved.id}
                  className="p-3 bg-black rounded-lg border border-gray-800 cursor-pointer hover:border-purple-500/30 hover:bg-gray-900/50 transition-all duration-200"
                  onClick={() => setInput(saved.command || "")}
                >
                  <div className="text-sm text-white truncate mb-1">{saved.command}</div>
                  <div className="text-xs text-gray-500">{saved.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NaturalLanguageContractInteraction