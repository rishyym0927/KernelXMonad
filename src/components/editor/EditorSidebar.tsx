"use client"
import { useState } from "react"
import { useAccount } from "wagmi"
import type { FileItem } from "@/types/editor"
import { toast } from "sonner"

interface AbiItem {
  type: string;
  inputs?: Array<{
    name: string;
    type: string;
  }>;
}

const BLOCK_EXPLORER_URL = "https://testnet.monadexplorer.com/"
const FAUCET_URL = "https://faucet.monad.xyz/"

interface EditorSidebarProps {
  selectedFile: FileItem | null
  onCompile: () => void
  onDeploy: () => void
 
  compilationResult?: {
    abi: string;
    bytecode: string;
    error?: string;
  };
  isCompiling?: boolean;
  deployedAddress: string | null;

}

const EditorSidebar = ({
  selectedFile,
  onCompile,
  onDeploy,

  compilationResult,
  isCompiling = false,
  deployedAddress,
}: EditorSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"abi" | "bytecode">("abi")
  const [args, setArgs] = useState<string[]>([]);


  if (!selectedFile) {
    return (
      <div className="w-80 bg-black border-l border-gray-800 p-6">
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">Select a file to see actions</p>
          <p className="text-xs text-gray-500 mt-1">Choose a file from the explorer</p>
        </div>
      </div>
    )
  }

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "sol":
        return "solidity"
      case "rs":
        return "rust"
      case "js":
        return "javascript"
      case "ts":
        return "typescript"
      default:
        return "unknown"
    }
  }

  const language = getFileLanguage(selectedFile.name)
  const isCompiled = compilationResult && compilationResult.abi

  const copyToClipboard = async (text: string, type: string) => {
  // Add check for browser environment
  if (typeof window === 'undefined') return;
  
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error("Failed to copy:", err)
  }
}

const DropTokenButton = () => {
    const { address } = useAccount()
    
    const handleDropToken = () => {
      if (!address) {
        console.error("No wallet connected")
        return
      }
      const url = `${FAUCET_URL}&address=${address}`
      // Use a useCallback or move window check inside
      const openWindow = () => {
        if (typeof window !== 'undefined') {
          window.open(url, "_blank")
        }
      }
      openWindow()
    }

    // Explicitly cast to boolean to ensure consistent rendering
    const isDisabled = Boolean(!address)

    return (
      <button
        onClick={handleDropToken}
        disabled={isDisabled}
        className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium 
          ${
  !isDisabled
    ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white shadow-lg hover:shadow-xl border border-gray-600"
    : "bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800"
}`}
      

      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Drop Token</span>
      </button>
    )
  }

  const ExplorerButton = ({ address }: { address: string }) => (
    <a
      href={`${BLOCK_EXPLORER_URL}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium border border-gray-700"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      View on Explorer
    </a>
  )

const getConstructorParams = (abi: string) => {
  try {
    const parsedAbi: AbiItem[] = JSON.parse(abi);
    const constructorAbi = parsedAbi.find((item) => item.type === "constructor");
    return constructorAbi ? constructorAbi.inputs || [] : [];
  } catch (e) {
    console.error("Error parsing ABI:", e);
    return [];
  }
};

  const renderSolidityActions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">Solidity Actions</h3>
          <p className="text-gray-400 text-xs">Smart contract operations</p>
        </div>
      </div>

      <button
        onClick={onCompile}
        disabled={isCompiling}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:from-gray-900 disabled:to-gray-800 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg border border-gray-700"
      >
        {isCompiling ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              ></path>
            </svg>
            <span>Compiling...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Compile</span>
          </>
        )}
      </button>

      {isCompiled && getConstructorParams(compilationResult.abi).length > 0 && (
        <div className="mt-4 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <h4 className="text-gray-300 text-xs font-semibold tracking-wide mb-3">CONSTRUCTOR PARAMETERS</h4>
          <div className="space-y-3">
          {getConstructorParams(compilationResult.abi).map((param, index: number) => (
  <div key={index} className="space-y-1">
    <label className="block text-xs text-gray-400">
      {param.name} ({param.type})
    </label>
    <input
      type="text"
      placeholder={`Enter ${param.type} value`}
      className="w-full px-3 py-2 bg-black rounded-lg border border-gray-800 text-white text-sm focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
      onChange={(e) => {
        // Handle parameter input change
        const newArgs = [...args];
        newArgs[index] = e.target.value;
        setArgs(newArgs);
      }}
    />
  </div>
))}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!compilationResult?.abi) return;
          const constructorParams = getConstructorParams(compilationResult.abi);
          if (constructorParams.length !== args.length || args.some((arg) => !arg.trim())) {
            toast.error("Please provide all constructor arguments");
            return;
          }
          onDeploy();
        }}
        disabled={!isCompiled}
        className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg ${
          isCompiled
            ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-700"
            : "bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span>Deploy</span>
      </button>

      <DropTokenButton />

      {/* Compilation Results */}
      {isCompiled && (
        <div className="mt-8 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab("abi")}
              className={`px-4 py-2 text-xs font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "abi"
                  ? "text-white bg-gray-800 border-b-2 border-gray-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              ABI
            </button>
            <button
              onClick={() => setActiveTab("bytecode")}
              className={`px-4 py-2 text-xs font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "bytecode"
                  ? "text-white bg-gray-800 border-b-2 border-gray-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              Bytecode
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-300 text-xs font-semibold tracking-wide">
                {activeTab === "abi" ? "CONTRACT ABI" : "BYTECODE"}
              </h4>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === "abi" ? compilationResult.abi : compilationResult.bytecode,
                    activeTab.toUpperCase(),
                  )
                }
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <div className="bg-black rounded-lg p-4 text-xs text-gray-300 font-mono max-h-40 overflow-y-auto border border-gray-800">
              <pre className="whitespace-pre-wrap break-all">
              {activeTab === "abi" ? (
  (() => {
    try {
      return JSON.stringify(JSON.parse(compilationResult.abi), null, 2)
    } catch {
      return compilationResult.abi
    }
  })()
) : (
  compilationResult.bytecode
)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-900/30 rounded-xl p-4 border border-gray-800">
        <h4 className="text-gray-300 text-xs font-semibold tracking-wide mb-3">COMPILER INFO</h4>
        <div className="text-xs text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Version:</span>
            <span className="text-gray-300">0.8.19</span>
          </div>
          <div className="flex justify-between">
            <span>Optimizer:</span>
            <span className="text-gray-300">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span>Runs:</span>
            <span className="text-gray-300">200</span>
          </div>
        </div>
      </div>
    </div>
  )



  return (
    <div className="w-80 bg-black border-l border-gray-800 p-6 overflow-y-auto pt-30">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-lg">Actions</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Language:</span>
          <span className="text-white capitalize font-medium px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
            {language}
          </span>
        </div>
      </div>

      {language === "solidity" && renderSolidityActions()}
      
      {!["solidity", "rust", "javascript", "typescript"].includes(language) && (
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">No actions available</p>
          <p className="text-xs text-gray-500 mt-1">This file type is not supported</p>
        </div>
      )}

      {/* Output Section */}
      <div className="mt-8">
        <h4 className="text-gray-300 text-xs font-semibold tracking-wide mb-3">OUTPUT</h4>
        <div className="bg-black rounded-xl p-4 text-xs text-gray-400 font-mono min-h-[120px] max-h-40 overflow-y-auto border border-gray-800">
          {compilationResult?.error ? (
            <div className="text-red-400 flex items-start space-x-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error: {compilationResult.error}</span>
            </div>
          ) : isCompiling ? (
            <div className="text-yellow-400 flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Compiling...</span>
            </div>
          ) : isCompiled ? (
            <div className="text-green-400 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span> Compilation successful</span>
            </div>
          ) : (
            <div className="text-gray-500 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Ready...</span>
            </div>
          )}
        </div>
      </div>

      {deployedAddress && (
        <div className="mt-6">
          <ExplorerButton address={deployedAddress} />
        </div>
      )}
    </div>
  )
}

export default EditorSidebar
